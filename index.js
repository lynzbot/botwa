

// const {
//    spawn
// } = require('child_process')
// const path = require('path')

// function start() {
//    let args = [path.join(__dirname, 'molto.js'), ...process.argv.slice(2)]
//    console.log([process.argv[0], ...args].join('\n'))
//    let p = spawn(process.argv[0], args, {
//          stdio: ['inherit', 'inherit', 'inherit', 'ipc']
//       })
//       .on('message', data => {
//          if (data == 'reset') {
//             console.log('Restarting Bot...')
//             p.kill()
//             start()
//             delete p
//          }
//       })
//       .on('exit', code => {
//          console.error('Exited with code:', code)
//          if (code == '.' || code == 1 || code == 0) start()
//       })
// }
// start()

const { spawn } = require('child_process');
const path = require('path');

function start() {
   let args = [path.join(__dirname, 'molto.js'), ...process.argv.slice(2)];
   let p = spawn(process.argv[0], args, {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
   });

   p.on('exit', code => {
      if (code !== 0) {
         console.log('Process exited, restarting...');
         start();
      }
   });

   // Watchdog Timer
   setInterval(() => {
      if (p.killed) {
         console.log('Process has been killed, restarting...');
         start();
      }
   }, 5000); // Set interval to check every 5 seconds
}

start();

