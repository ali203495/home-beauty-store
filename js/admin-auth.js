/**
 * ADMIN AUTHENTICATION MODULE
 * Handles login, hashing, and brute-force protection.
 */

window.AdminAuth = {
    LOCKOUT_LIMIT: 5,
    LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes

    async hashPassword(ascii) {
        function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
        let mathPow = Math.pow, maxWord = mathPow(2, 32), result = '', words = [], asciiBitLength = ascii.length * 8;
        let hash = [], k = [], i = 0;
        let isPrimes = [], n = 2;
        while (isPrimes.length < 64) {
            let found = false;
            for (i = 2; i <= mathPow(n, 0.5); i++) { if (n % i === 0) { found = true; break; } }
            if (!found) {
                if (isPrimes.length < 8) hash.push((mathPow(n, 0.5) % 1 * maxWord) | 0);
                k.push((mathPow(n, 1 / 3) % 1 * maxWord) | 0);
                isPrimes.push(n);
            }
            n++;
        }
        ascii += '\x80';
        while (ascii.length % 64 - 56) ascii += '\x00';
        for (i = 0; i < ascii.length; i++) {
            let charCode = ascii.charCodeAt(i);
            words[i >> 2] |= charCode << ((3 - i) % 4 * 8);
        }
        words[words.length] = ((asciiBitLength / maxWord) | 0);
        words[words.length] = (asciiBitLength | 0);
        for (let j = 0; j < words.length; ) {
            let w = words.slice(j, j += 16), oldHash = hash;
            hash = hash.slice(0, 8);
            for (i = 0; i < 64; i++) {
                let w15 = w[i - 15], w2 = w[i - 2];
                let a = hash[0], e = hash[4];
                let temp1 = hash[7] + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + ((e & hash[5]) ^ (~e & hash[6])) + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | 0);
                let temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
                hash = [(temp1 + temp2) | 0].concat(hash);
                hash[4] = (hash[4] + temp1) | 0;
            }
            for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
        }
        for (i = 0; i < 8; i++) {
            for (let j = 3; j + 1; j--) {
                let b = (hash[i] >> (j * 8)) & 255;
                result += (b < 16 ? '0' : '') + b.toString(16);
            }
        }
        return result;
    },

    async login(username, password) {
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const err = await response.json();
                return { success: false, msg: err.error || 'Identifiants invalides' };
            }

            const data = await response.json();
            
            // 3. Success -> set session
            sessionStorage.setItem('mlh_admin_token', data.token);
            sessionStorage.setItem('mlh_admin_logged_in', 'true');
            sessionStorage.setItem('mlh_admin_user', data.user.username);
            sessionStorage.setItem('mlh_admin_role', data.user.role);
            sessionStorage.setItem('mlh_admin_login_time', Date.now().toString());

            AdminLogs.log(`Connexion réussie : ${data.user.username} (${data.user.role})`, 'success');
            return { success: true };
        } catch (err) {
            console.error("Login API Error:", err);
            return { success: false, msg: 'Erreur de connexion au serveur' };
        }
    },

    setSession(admin) {
        sessionStorage.setItem('mlh_admin_logged_in', 'true');
        sessionStorage.setItem('mlh_admin_user', admin.username);
        sessionStorage.setItem('mlh_admin_role', admin.role);
        sessionStorage.setItem('mlh_admin_login_time', Date.now().toString());
    },

    logout() {
        AdminLogs.log('Déconnexion de la session', 'info');
        sessionStorage.clear();
        window.location.href = 'admin-login.html';
    },

    /** ── RBAC Helpers ── */

    async hasPermission(requiredRole) {
        const currentRole = sessionStorage.getItem('mlh_admin_role');
        if (!currentRole) return false;
        
        const hierarchy = { 'Super Admin': 10, 'Admin': 5, 'Editor': 2 };
        return (hierarchy[currentRole] || 0) >= (hierarchy[requiredRole] || 0);
    },

    /** ── Brute Force Protection Helpers ── */
    
    getLoginAttempts(username) {
        const data = JSON.parse(localStorage.getItem('mlh_login_attempts') || '{}');
        return data[username] || { count: 0, lockedUntil: 0 };
    },

    incrementLoginAttempts(username) {
        const data = JSON.parse(localStorage.getItem('mlh_login_attempts') || '{}');
        const attempts = data[username] || { count: 0, lockedUntil: 0 };
        attempts.count++;
        
        if (attempts.count >= this.LOCKOUT_LIMIT) {
            attempts.lockedUntil = Date.now() + this.LOCKOUT_TIME;
            AdminLogs.log(`SÉCURITÉ : Compte ${username} verrouillé pour 15 minutes`, 'error');
        }
        
        data[username] = attempts;
        localStorage.setItem('mlh_login_attempts', JSON.stringify(data));
    },

    resetLoginAttempts(username) {
        const data = JSON.parse(localStorage.getItem('mlh_login_attempts') || '{}');
        delete data[username];
        localStorage.setItem('mlh_login_attempts', JSON.stringify(data));
    },

    /** ── Password Recovery Logic ── */

    async initiateRecovery(emailInput) {
        const admins = await AdminDB.fetchAll();
        const user = admins.find(a => a.recoveryEmail.toLowerCase() === emailInput.toLowerCase());
        
        if (!user) return { success: false, msg: 'Aucun compte associé à cet email' };
        
        const code = RecoveryStore.generate(user.username);
        const masked = user.recoveryEmail.replace(/(..)(.*)(@.*)/, '$1***$3');

        // Note: Real Email Notification would be triggered here
        AdminLogs.log(`Code de récupération généré pour ${user.username}`, 'info');
        
        return { 
            success: true, 
            username: user.username,
            maskedEmail: masked, 
            code 
        };
    },

    async verifyNewAccount(username, code) {
        const isValid = RecoveryStore.verify(username, code);
        if (!isValid) return false;

        const user = await AdminDB.findByUsername(username);
        if (user) {
            user.status = 'Active';
            await AdminDB.saveAdmin(user);
            AdminLogs.log(`Compte activé : ${username}`, 'success');
            return true;
        }
        return false;
    },

    async resetPassword(username, newPassword) {
        const user = await AdminDB.findByUsername(username);
        if (!user) return false;

        user.passwordHash = await this.hashPassword(newPassword);
        await AdminDB.saveAdmin(user);
        AdminLogs.log(`Réinitialisation mdp : Succès pour ${username}`, 'success');
        return true;
    }
};
