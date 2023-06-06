import zipfile
import os
import shutil
import sys
import json

file_path = sys.argv[1]
extract_path = sys.argv[2]
zip1 = zipfile.ZipFile(file_path)
zip1.extractall(extract_path)
zip1.close()

def move1():
    current_directory = extract_path
    xl_folder = os.path.join(current_directory, "xl")
    os.chdir(xl_folder)
    vba_project_file = os.path.join(xl_folder, "vbaProject.bin")

    os.chdir("..")
    parent_folder = os.getcwd()

    new_file_path = os.path.join(parent_folder, "vbaProject.bin")
    shutil.move(vba_project_file, new_file_path)
move1()

with open("vbaProject.bin", "rb") as f:
    while True:
        data = f.read()
        if not data:
            break

        def remove(input):
            output = input.replace(b"Set-MpPreference -DisableRealtimeMonitoring", b"")
            return output

        result = remove(data)

        def save(input, save_path):
            with open(save_path, "wb") as file:
                file.write(input)

        save_path = "vbaProject1.bin"
        save(result, save_path)

        def move2():
            current_folder = os.getcwd()
            excel_folder = os.path.join(current_folder, "xl")
            file = os.path.join(current_folder, "vbaProject1.bin")
            bin_file = os.path.join(excel_folder, "vbaProject1.bin")
            shutil.move(file, bin_file)

            new_file = os.path.join(current_folder, "vbaProject.bin")
            if os.path.exists(file):
                os.rename(file, new_file)

        move2()

        def rename():
            current_directory = os.getcwd()
            xl_directory = os.path.join(current_directory, "xl")
            current_file_path = os.path.join(xl_directory, "vbaProject1.bin")
            new_file_path = os.path.join(xl_directory, "vbaProject.bin")
            if os.path.exists(current_file_path):
                os.rename(current_file_path, new_file_path)

        rename()

        def zip():
            current_directory = os.getcwd()
            fixfile = os.path.join(current_directory, "fix.xlsm")
            rel_directory = os.path.join(current_directory, "_rels")
            docprops_directory = os.path.join(current_directory, "docProps")
            xl_directory = os.path.join(current_directory, "xl")
            content_types_xml = os.path.join(current_directory, "[Content_Types].xml")

            with zipfile.ZipFile(fixfile, "w", compression=zipfile.ZIP_DEFLATED) as fix_xlsm:
                for root, dirs, files in os.walk(rel_directory):
                    for file in files:
                        file_path = os.path.join(root, file)
                        fix_xlsm.write(file_path, os.path.relpath(file_path, current_directory))

                for root, dirs, files in os.walk(docprops_directory):
                    for file in files:
                        file_path = os.path.join(root, file)
                        fix_xlsm.write(file_path, os.path.relpath(file_path, current_directory))

                for root, dirs, files in os.walk(xl_directory):
                    for file in files:
                        if file != "vbaProject.bin":  # fix.xlsm 파일에 포함시키지 않을 파일명 지정
                            file_path = os.path.join(root, file)
                            fix_xlsm.write(file_path, os.path.relpath(file_path, current_directory))

                fix_xlsm.write(content_types_xml, os.path.relpath(content_types_xml, current_directory))
            shutil.rmtree(rel_directory)
            shutil.rmtree(docprops_directory)
            shutil.rmtree(xl_directory)
            os.remove(content_types_xml)
            
            result = {"file_path": fixfile}
            json_result = json.dumps(result)
            print(json_result)

        zip()
vba_project_bin = os.path.join(extract_path, "vbaProject.bin")
if os.path.exists(vba_project_bin):
    os.remove(vba_project_bin)
