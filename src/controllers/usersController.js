import { supabase } from '../db/supabaseClient.js';

export const updateUser = async (res, req) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const refreshToken = req.headers["x-refresh-token"];

    const { name, profile } = req.body;

    if (!token || !refreshToken) return res.status(401).json({ error: 'Missing access token' });
    if (!chatroom_id || !content) return res.status(400).json({ error: 'Missing chatroom ID or message content' });

    const { data: session, error: authError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: refreshToken,
    });
    if (authError) return res.status(401).json({ error: authError.message });

    const { data, error } = await supabase
        .from('users')
        .insert([{ name, profile }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};