/**
 * ADMIN DATABASE MODULE
 * Handles persistence, built-in accounts, and recovery state.
 */

const BUILT_IN_ADMINS = [
    {
        username: 'abdelaali',
        passwordHash: 'fa9304349b9d8b93e5010a67a2f78bf1f174c2678d266316d82fb6a59926771c', // 1234!@#$
        recoveryEmail: 'abdelaali.markabi@gmail.com',
        role: 'Super Admin',
        status: 'Active'
    },
    {
        username: 'brahim',
        passwordHash: '517a291a509415b77ef298a4066d042be23150203d8f6837c0e46e770b1b8f87', // aissa255
        recoveryEmail: 'brahimelgauerhae@gmail.com',
        role: 'Admin',
        status: 'Active'
    },
    {
        username: 'mari',
        passwordHash: '517a291a509415b77ef298a4066d042be23150203d8f6837c0e46e770b1b8f87', // aissa255
        recoveryEmail: 'marimarimarkabi@gmail.com',
        role: 'Admin',
        status: 'Active'
    }
];

window.AdminDB = {
    async fetchAll() {
        const stored = localStorage.getItem('elwali_admins');
        let admins = [];
        try {
            admins = stored ? JSON.parse(stored) : [];
            if (!Array.isArray(admins)) admins = [];
        } catch (e) {
            console.warn('Failed to parse admins, starting fresh', e);
            admins = [];
        }

        // Force Synchronization for Built-in Admins
        BUILT_IN_ADMINS.forEach(builtIn => {
            const existingIdx = admins.findIndex(a => a.username.toLowerCase() === builtIn.username.toLowerCase());
            if (existingIdx !== -1) {
                // Keep the record but ensure critical fields match built-in definitions if not manually changed?
                // Actually, for built-ins, we usually want them fixed unless we allow editing them.
                // For now, let's just ensure they exist.
            } else {
                admins.push(builtIn);
            }
        });

        return admins.map(a => ({ ...a, status: a.status || 'Active', role: a.role || 'Admin' }));
    },

    async saveAdmin(admin) {
        const admins = await this.fetchAll();
        const existingIdx = admins.findIndex(a => a.username.toLowerCase() === admin.username.toLowerCase());
        if (existingIdx !== -1) {
            admins[existingIdx] = { ...admins[existingIdx], ...admin };
        } else {
            admins.push(admin);
        }
        return this.saveAll(admins);
    },

    async saveAll(admins) {
        localStorage.setItem('elwali_admins', JSON.stringify(admins));
        return true;
    },

    async delete(username) {
        const admins = await this.fetchAll();
        const filtered = admins.filter(a => a.username.toLowerCase() !== username.toLowerCase());
        localStorage.setItem('elwali_admins', JSON.stringify(filtered));
        return true;
    },

    async findByUsername(username) {
        const admins = await this.fetchAll();
        return admins.find(a => a.username.toLowerCase() === username.toLowerCase());
    }
};

window.RecoveryStore = {
    codes: new Map(), // username -> {code, expires}
    
    generate(username) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        this.codes.set(username.toLowerCase(), {
            code,
            expires: Date.now() + (10 * 60 * 1000) // 10 minutes
        });
        return code;
    },

    verify(username, code) {
        const record = this.codes.get(username.toLowerCase());
        if (!record) return false;
        if (Date.now() > record.expires) {
            this.codes.delete(username.toLowerCase());
            return false;
        }
        const isValid = record.code === code;
        if (isValid) this.codes.delete(username.toLowerCase());
        return isValid;
    }
};
