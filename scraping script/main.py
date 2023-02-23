import re
import tweepy
import config as cf
from json import loads
from datetime import datetime
import pandas as pd
from os import path
from pymongo import MongoClient, UpdateOne
import config as cf
import emoji
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from string import punctuation

eval_obj = SentimentIntensityAnalyzer()
api_key = cf.twitter_apikey
api_key_secret = cf.twitter_secretapikey
access_token = cf.twitter_accesstoken
access_token_secret = cf.twitter_accesstokensecret
auth = tweepy.OAuthHandler(api_key, api_key_secret)

# set access to user's access key and access secret
auth.set_access_token(access_token, access_token_secret)

# calling the api
api = tweepy.API(auth, wait_on_rate_limit=True)
stats = api.rate_limit_status()


def load_db(df, table_name):
    db = MongoClient(cf.mdb_string)
    mydatabase = db[cf.mdb_db]

    dump_df = df
    updates = []
    for _, row in dump_df.iterrows():
        if table_name == "Trends":
            updates.append(UpdateOne({'Trend_Name': row.get('Trend_Name'), 'WOEID': row.get('WOEID')},
                                     {
                '$set': {
                    'Search_Query': row.get('Search_Query'),
                    'Total_Tweets_Count': row.get('Total_Tweets_Count'),
                    'Pulled_At': row.get('Pulled_At')
                },
                "$currentDate": {"lastModified": True}
            }, upsert=True))
        elif table_name == "Tweets":
            updates.append(UpdateOne({'tweet_id': row.get('tweet_id'), 'WOEID': row.get('WOEID')},
                                     {
                '$set': {
                    'tweet_created_at': row.get('tweet_created_at'),
                    'tweet_raw_text': row.get('tweet_raw_text'),
                    'tweet_cleaned_text': row.get('tweet_cleaned_text'),
                    'tweet_emojis': row.get('tweet_emojis'),
                    'tweet_hashtags': row.get('tweet_hashtags'),
                    'tweet_compound_score': row.get('tweet_compound_score'),
                    'tweet_lang': row.get('tweet_lang'),
                    'tweet_source': row.get('tweet_source'),
                    'tweet_retweet_count': row.get('tweet_retweet_count'),
                    'tweet_like_count': row.get('tweet_like_count'),
                    'tweet_search_query': row.get('tweet_search_query'),
                    'tweet_scrapped_datetime_utc': row.get('tweet_scrapped_datetime_utc')
                },
                "$currentDate": {"lastModified": True}
            }, upsert=True))

    mydatabase[table_name].bulk_write(updates)
    result = mydatabase[table_name].bulk_write(updates)
    # result = result.bulk_api_result
    # print("Summary Inserted: {} Updated: {} Errors: {}".format(
    #     max(result['nInserted'], result['nUpserted']), result['nModified'], max(result['writeErrors'], result['writeConcernErrors'])))
    db.close()


def cleanTweet(text):
    text = re.sub(r'@[A-Za-z0-9_]+', '', text)  # remove @mentions
    text = re.sub(r'\#', '', text)  # remove hash tag
    text = re.sub(r'RT[\s]+', '', text)  # remove RT
    text = re.sub(r'https?:\/\/\S+', '', text)  # remove hyperlink
    text = re.sub(r'\n', ' ', text)  # remove next line character
    text = re.sub(r'[0-9]', '', text)  # Remove numbers
    # remove punctuations
    text = ''.join([char for char in text if char not in punctuation])
    text = text.strip()  # remove whitespaces
    return text


def read_location(filepath):

    if not path.exists(filepath):
        raise FileExistsError("File Doesnot exists!! Please check filepath")
    locations_json = open(filepath, "r")
    locations_json = loads(locations_json.read())
    return locations_json


def pull_trends(woeid, max_trends=50):
    trends_list = []
    trends = api.get_place_trends(woeid)
    for i in range(min(len(trends[0]['trends']), max_trends)):
        # if no tweets counts return by API skip it
        if not trends[0]['trends'][i]['tweet_volume']:
            continue
        trends_list.append(
            [trends[0]['trends'][i]['name'], trends[0]['trends'][i]['query'], trends[0]['trends'][i]['tweet_volume'], woeid, datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")])
    return trends_list


def pull_popular_tweets(topics_list, woeid, max_tweet_topic=20, total_max_tweets=100):

    df_return = pd.DataFrame()

    for topic in topics_list:
        if len(df_return.index) == total_max_tweets:
            break
        tweets = tweepy.Cursor(api.search_tweets, q=topic[1],                         # search for each trending topic
                               # tweets in english , type is "recent"/"popular"
                               lang="en", result_type='popular',
                               tweet_mode='extended', count=50).items(max_tweet_topic)
        tweets_list = list(tweets)
        print("Topic: "+topic[0]+" Pulled_Tweets: "+str(len(tweets_list)))
        for tweet in tweets_list:
            clean_text = cleanTweet(tweet.full_text)
            temp_dict = {
                'tweet_id': tweet.id,
                'WOEID': woeid,
                'tweet_created_at': tweet.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                'tweet_raw_text': tweet.full_text.replace("'", "''"),
                'tweet_cleaned_text': clean_text,
                'tweet_emojis': (lambda x: ', '.join(c for c in x if c in emoji.EMOJI_DATA))(clean_text),
                'tweet_hashtags': (lambda x: ", ".join(re.findall(r"#(\w+)", x)))(tweet.full_text),
                'tweet_compound_score': (lambda x: eval_obj.polarity_scores(x)['compound'])(clean_text),
                'tweet_lang': tweet.lang,
                'tweet_source': tweet.source,
                'tweet_retweet_count': tweet.retweet_count,
                'tweet_like_count': tweet.favorite_count,
                'tweet_search_query': topic[0],
                'tweet_scrapped_datetime_utc': datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            }
            temp_df = pd.DataFrame([temp_dict])
            df_return = pd.concat([df_return, temp_df], ignore_index=True)
    print("Total Tweets Pulled: "+str(len(df_return.index)))
    return df_return


def build_dataset(filelocation):
    records_trend = 0
    records_tweets = 0
    locations = read_location(filelocation)
    for location in locations:
        final_tweets_df = pd.DataFrame()
        final_trends_df = pd.DataFrame()
        print("\nScraping Tweets for Location: "+location['name'])
        trend_list = pull_trends(location['woeid'], max_trends=20)
        trend_df = pd.DataFrame(trend_list, columns=[
                                'Trend_Name', 'Search_Query', 'Total_Tweets_Count', 'WOEID', 'Pulled_At'])
        trend_df = trend_df.fillna(0)

        final_trends_df = pd.concat(
            [final_trends_df, trend_df], ignore_index=True)

        final_tweets_df = pd.concat([final_tweets_df,
                                     pull_popular_tweets(trend_list, location['woeid'], max_tweet_topic=30, total_max_tweets=10000)], ignore_index=True)
        if len(final_tweets_df.index) == 0:
            continue
        trend_df = pd.merge(trend_df, final_tweets_df.groupby(['WOEID', 'tweet_search_query']).size().reset_index(
            name='counts'), how="left", left_on=['WOEID', 'Trend_Name'], right_on=['WOEID', 'tweet_search_query'])
        trend_df = trend_df.dropna()
        records_trend += len(final_trends_df.index)
        records_tweets += len(final_tweets_df.index)
        load_db(final_tweets_df, "Tweets")
        load_db(final_trends_df, "Trends")

    print("Total Records Pulled\nTweets: {} Trends: {}".format(
        records_tweets, records_trend))
    # return final_tweets_df,final_trends_df


if __name__ == "__main__":
    script_start = datetime.now()
    print("Begining Pulling Data at: " +
          script_start.strftime("%Y-%m-%d %H:%M:%S"))
    build_dataset(filelocation="Locations.json")
    script_end=datetime.now()
    print("Execution Time: {} seconds".format(script_start-script_end))
