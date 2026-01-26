import {
    fileIcon,
    folderIcon,
    markdownIcon,
    LabIcon,
    notebookIcon,
    jsonIcon,
    pythonIcon, yamlIcon,
} from "@jupyterlab/ui-components";
import hdfSvg from "./assets/hdf.svg";

export function iconForExtension(extension: string): LabIcon {
    switch (extension) {
        case "folder":
            return folderIcon;
        case ".hdf":
        case ".hdf5":
        case ".h5":
            return new LabIcon({name: "jphf:hdf", svgstr: hdfSvg});
        case ".ipynb":
            return notebookIcon;
        case ".json":
            return jsonIcon;
        case ".md":
            return markdownIcon;
        case ".py":
        case ".pyi":
            return pythonIcon;
        case ".yaml":
        case ".yml":
            return yamlIcon;
        default:
            return fileIcon;
    }
}
