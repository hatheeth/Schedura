import { supabase } from "../db/supabaseClient.js";

export const getResources = async (req, res) => {
    try {
        const { data, error } = await supabase.from("resources").select("*");
        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const getResourceById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from("resources")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const createResource = async (req, res) => {


    try {

        const token = req.headers.authorization?.replace("Bearer ", "");
        const refreshToken = req.headers["x-refresh-token"];

        if (!token || !refreshToken) {
            return res.status(401).json({ success: false, error: "Missing tokens" });
        }

        // Establish session using both tokens
        const { data: session, error: authError } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: refreshToken,
        });

        if (authError || !session?.user?.id) {
            return res.status(401).json({ success: false, error: "Invalid Session" });
        }

        const { name, type, location, description } = req.body;


        const { data, error } = await supabase
            .from("resources")
            .insert([{ name, type, location, description }])
            .select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const updateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const { data, error } = await supabase
            .from("resources")
            .update(updates)
            .eq("id", id)
            .select();
        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from("resources").delete().eq("id", id);
        if (error) throw error;
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

