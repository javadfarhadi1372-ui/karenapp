const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('native',{
 load:()=>ipcRenderer.invoke('load'),saveSync:j=>ipcRenderer.sendSync('saveSync',j),
 actLoad:()=>ipcRenderer.invoke('actLoad'),actSaveSync:j=>ipcRenderer.sendSync('actSave',j),
 http:o=>ipcRenderer.invoke('http',o),
 alert:m=>ipcRenderer.sendSync('alert',m),confirm:m=>ipcRenderer.sendSync('confirm',m)
});
