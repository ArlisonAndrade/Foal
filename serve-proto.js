const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3031;
const FILE = path.join('C:\\Users\\Arlison Andrade\\Documents\\Downloads\\FOAL — Protótipo Completo_files', 'FOAL Telas (standalone).html');

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  fs.createReadStream(FILE).pipe(res);
}).listen(PORT, () => console.log('Serving on port ' + PORT));
