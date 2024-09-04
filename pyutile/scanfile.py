import hashlib
import requests # type: ignore
import json
import sys
from dotenv import load_dotenv
import os
from time import sleep


def main():


    load_dotenv()

    file_path = sys.argv[1]

    with open(file_path, "rb") as f:
        file_content = f.read()
    uploadurl = "https://www.virustotal.com/api/v3/files"

    files= {"file" : (file_path, open(file_path,'rb')) }

    headers = {
        "accept": "application/json",
        "x-apikey": os.environ.get('API_KEY')
    }

    uploadresponse = requests.post(uploadurl,files=files, headers=headers)
    
    sleep(60)
    
    hash_value = hashlib.sha256(file_content).hexdigest()

    url = "https://www.virustotal.com/api/v3/files/{}".format(hash_value)

    headers = {
        "accept": "application/json",
        "x-apikey": os.environ.get('API_KEY')
    }

    response = requests.get(url, headers=headers)
    result = json.dumps(response.json())
    print(result)
    return result   
if __name__=='__main__':
    main()