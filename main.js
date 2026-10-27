const {app,BrowserWindow,Menu,ipcMain,dialog,net}=require('electron'),fs=require('fs'),path=require('path');
if(!app.requestSingleInstanceLock()){app.quit()}
// مسیر ذخیره‌سازی ثابت و مستقل از نام نسخه‌های قبلی
const DATA=path.join(app.getPath('appData'),'Karen');
app.setPath('userData',DATA);
// انتقال اطلاعات نسخه‌های قبلی (farhadi-sales / KarenSales) در اولین اجرا
try{
 fs.mkdirSync(DATA,{recursive:true});
 for(const f of ['farhadi-data.json','farhadi-act.json']){
  if(fs.existsSync(path.join(DATA,f)))continue;
  for(const old of ['farhadi-sales','KarenSales','Karen Sales','farhadi']){
   const p=path.join(app.getPath('appData'),old,f);
   if(fs.existsSync(p)){fs.copyFileSync(p,path.join(DATA,f));break}
  }
 }
}catch(e){}
const file=()=>path.join(DATA,'farhadi-data.json'),afile=()=>path.join(DATA,'farhadi-act.json');
ipcMain.handle('load',()=>{try{return fs.readFileSync(file(),'utf8')}catch(e){return null}});
ipcMain.handle('actLoad',()=>{try{return fs.readFileSync(afile(),'utf8')}catch(e){return null}});
ipcMain.on('actSave',(e,j)=>{try{fs.writeFileSync(afile(),j);e.returnValue=true}catch(x){e.returnValue=false}});
let bk=false;
ipcMain.on('saveSync',(e,j)=>{try{const f=file();if(!bk&&fs.existsSync(f)){fs.copyFileSync(f,f+'.bak');bk=true}fs.writeFileSync(f+'.tmp',j);fs.renameSync(f+'.tmp',f);e.returnValue=true}catch(x){e.returnValue=false}});
// درخواست شبکه از طریق هسته Chromium (بدون محدودیت CORS، با تایم‌اوت و گزارش خطا)
ipcMain.handle('http',(e,o)=>new Promise(res=>{
 let done=false;const fin=v=>{if(!done){done=true;clearTimeout(t);res(v)}};
 let req;const t=setTimeout(()=>{try{req&&req.abort()}catch(x){}fin({ok:false,err:'timeout'})},o.timeout||15000);
 try{
  req=net.request({method:o.method||'GET',url:o.url});
  for(const k in (o.headers||{}))req.setHeader(k,o.headers[k]);
  req.on('response',r=>{const ch=[];r.on('data',c=>ch.push(c));r.on('end',()=>fin({ok:true,status:r.statusCode,body:Buffer.concat(ch).toString('utf8')}));r.on('error',x=>fin({ok:false,err:String(x.message||x)}))});
  req.on('error',x=>fin({ok:false,err:String(x.message||x)}));
  if(o.body)req.write(o.body);req.end();
 }catch(x){fin({ok:false,err:String(x.message||x)})}
}));
// alert/confirm بومی (جلوگیری از قفل شدن کادرهای ورودی بعد از پنجره‌های هشدار)
const refocus=w=>{if(w&&!w.isDestroyed()){w.blur();w.focus();w.webContents.focus()}};
ipcMain.on('alert',(e,m)=>{const w=BrowserWindow.fromWebContents(e.sender);dialog.showMessageBoxSync(w,{type:'info',title:'Karen',message:String(m),buttons:['باشه'],noLink:true});refocus(w);e.returnValue=true});
ipcMain.on('confirm',(e,m)=>{const w=BrowserWindow.fromWebContents(e.sender);const r=dialog.showMessageBoxSync(w,{type:'question',title:'Karen',message:String(m),buttons:['بله','خیر'],defaultId:0,cancelId:1,noLink:true});refocus(w);e.returnValue=(r===0)});
let win;
app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.focus()}});
app.whenReady().then(()=>{Menu.setApplicationMenu(null);
 win=new BrowserWindow({width:1280,height:800,title:'Karen',icon:path.join(__dirname,'icon.ico'),webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false}});
 win.loadFile('index.html');
 win.webContents.setWindowOpenHandler(({url})=>{if(/^https?:/.test(url))require('electron').shell.openExternal(url);return{action:'deny'}});
 win.webContents.on('will-navigate',(ev,u)=>{if(!u.startsWith('file:'))ev.preventDefault()});
});
app.on('window-all-closed',()=>app.quit());
