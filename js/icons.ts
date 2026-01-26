import {fileIcon,folderIcon,markdownIcon,LabIcon,notebookIcon,jsonIcon} from "@jupyterlab/ui-components";

export function iconForExtension(extension:string):LabIcon{
    switch(extension){
        case "folder":
            return folderIcon;
        case ".md":
            return markdownIcon;
        case ".ipynb":
            return notebookIcon;
        case ".json":
            return jsonIcon;
        default:
            return fileIcon;
    }
}
