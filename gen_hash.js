const crypto = require('crypto');
const password = 'abdelaali.markabi1234!@#$';
const hash = crypto.createHash('sha256').update(password).digest('hex');
const fs = require('fs');
fs.writeFileSync('/home/xyz/Documents/home-beauty-store/final_hash.txt', hash);
console.log('Hash written to final_hash.txt');
