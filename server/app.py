from flask import Flask, render_template, jsonify
from flask_restful import Resource, Api
import json
from config import config
app = Flask(__name__)
api = Api(app)


class HelloWorld(Resource):
    def get(self, name):
        return {1: name}


api.add_resource(HelloWorld, "/helloworld/<string:name>")

# @app.route("/")
# def home():
#     print(config.mdb_db)
#     return render_template("home.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
