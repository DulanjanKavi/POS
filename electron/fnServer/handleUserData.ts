import * as path from 'path';
import * as fs from 'fs';



export interface UserDataInterface {
    company_id: string;
    company_name?: string;
    company?: {
        id: string;
        name: string;
        address: string;
        email: string;
        phone: string;
        logo: string;
        branch: any;
    }
    user_id: string;
    first_name: string;
    last_name: string;
    role: string;
    email: string;
    token: string;
}

export function saveUserData(data: UserDataInterface) {
    const userDataPath = path.join(process.env.APP_ROOT, 'user_data.json');
    let userData = getUserData();
    if (!userData) {
        userData = {
            company_id: '',
            user_id: '',
            first_name: '',
            last_name: '',
            role: '',
            email: '',
            token: ''
        };
    }
    Object.assign(userData, data);
    fs.writeFileSync(userDataPath, JSON.stringify(data, null, 4));
}

export function getUserData(): UserDataInterface | undefined {
    const userDataPath = path.join(process.env.APP_ROOT, 'user_data.json');
    console.log(userDataPath);
    if (fs.existsSync(userDataPath)) {
        return JSON.parse(fs.readFileSync(userDataPath, 'utf-8'));
    }
    return undefined;
}

export async function validateUserToken(): Promise<boolean> {
    const userData = getUserData();
    if (!userData) {
        return false;
    }

    const token = userData.token;
    if (!token) {
        return false;
    }

    const url = `${process.env.SERVER_URL}/user-manager/is_token_valid`;
    const resp = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (resp.status !== 200) {
        return false;
    }

    return true;
}

export function removeUserData() {
    const userData = getUserData();
    if (userData) {
        userData.token = '';
        saveUserData(userData);
    }
}