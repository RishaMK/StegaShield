from flask import Flask, request, jsonify
import logging
import json
import os

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
app = Flask(__name__)


@app.route('/logs', methods=["PUT"])
def put():
    data = request.json
    username = data.get("username")
    log = data.get("log")

    if not username or not log:
        logger.error("Username or log is missing in the request.")
        return jsonify({"error": "Username and log are required."}), 400

    try:
        with open("logs.json", "r") as logfile:
            logfile_data = json.load(logfile)
    except FileNotFoundError:
        logfile_data = {}
        logger.info("logs.json file not found, creating a new one.")
    except json.JSONDecodeError:
        logger.error("Error decoding JSON from logs.json.")
        return jsonify(
            {
                "error": "Failed to read log data."
            }
        ), 500

    if username not in logfile_data:
        logfile_data[username] = []

    logfile_data[username].append(log)

    try:
        with open("logs.json", "w") as new_logs:
            json.dump(logfile_data, new_logs)
        logger.info(f"Log entry added for user: {username}.")
        return "OK", 200
    except IOError as e:
        logger.error(f"Failed to write to logs.json: {e}")
        return jsonify(
            {
                "error": "Failed to save log data."
            }
        ), 500


@app.route("/set-hash", methods=["POST"])
def set_hash():
    data = request.json
    hash_value = data.get("hash")

    if not hash_value:
        logger.error("Hash value is missing in the request.")
        return jsonify(
            {
                "error": "Hash value is required."
            }
        ), 400

    try:
        with open("hash.txt", "w") as hash_file:
            hash_file.write(hash_value)
        logger.info("Hash value saved successfully.")
        return jsonify(
            {
                "message": "Hash value saved successfully"
            }
        ), 200
    except IOError as e:
        logger.error(f"Failed to write to hash.txt: {e}")
        return jsonify(
            {
                "error": "Failed to save hash value."
            }
        ), 500


@app.route("/get-hash", methods=["GET"])
def get_hash():
    if os.path.exists("hash.txt"):
        try:
            with open("hash.txt", "r") as hash_file:
                hash_value = hash_file.read()
            logger.info("Hash value retrieved successfully.")
            return jsonify(
                {
                    "hash": hash_value
                }
            ), 200
        except IOError as e:
            logger.error(f"Failed to read from hash.txt: {e}")
            return jsonify(
                {
                    {"error": "Failed to retrieve hash value."}
                }
            ), 500
    else:
        logger.warning("No hash is set for the user.")
        return jsonify(
            "No hash is set for you", 400
        )


if (__name__ == "__main__"):
    app.run(debug=True, port=3333)
