import sys
import json
from oletools import olevba
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

db_url = os.getenv('MONGODB_URL')
client = MongoClient(db_url)
db = client["virus_scan"]  # 데이터베이스 선택
collection = db["VBAmacro"]  # 컬렉션 선택 (매크로 구문을 저장한 컬렉션명)
file_path = sys.argv[1]

    
def find_vba_macro(file_path):
    vbaparser = olevba.VBA_Parser(file_path)
    vbaparser.analyze_macros()
    macros = vbaparser.extract_macros()
    return macros

def extract_disable_monitoring_macros(macros, db_macros):
    disable_monitoring_macros = []
    
    for macro in macros:
        macro_content = macro[3]
        # 매크로 구문과 DB에 저장된 매크로 구문을 비교합니다.
        for db_macro in db_macros:
            if db_macro["macro"] in macro_content:
                disable_monitoring_macros.append({
                    'db_macro' : db_macro["macro"],
                    'macro_content' : macro_content
                })

    return disable_monitoring_macros

db_macros = [macro for macro in collection.find({}, {"macro": 1})]
macros = list(find_vba_macro(file_path))
disable_monitoring_macros = extract_disable_monitoring_macros(macros,db_macros)
response = {
    'disable_monitoring_macros': disable_monitoring_macros
}

json_response = json.dumps(response, default=str)
print(json_response)

