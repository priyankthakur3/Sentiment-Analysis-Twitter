from pymongo import MongoClient
import connection as cf

__connection__ = None
__db__ = None


def getDBConnection():
    '''Function to get DB Connection'''
    if not __connection__:
        __connection__ = MongoClient(cf.mdb_connection_string)
        __db__ = __connection__[cf.mdb_db]
    return __db__
