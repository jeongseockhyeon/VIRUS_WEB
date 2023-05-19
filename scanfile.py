import hashlib
import requests
import json
import sys
from dotenv import load_dotenv
import os


def main():

    load_dotenv()

    file_path = sys.argv[1]
    with open(file_path, "rb") as f:
        file_content = f.read()
    hash_value = hashlib.sha256(file_content).hexdigest()

    url = "https://www.virustotal.com/api/v3/files/{}".format(hash_value)

    headers = {
        "accept": "application/json",
        "x-apikey": os.environ.get('API_KEY')
    }

    response = requests.get(url, headers=headers)
    result = json.dumps(response.json())
    return result   
if __name__=='__main__':
    main()