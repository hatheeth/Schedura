import { supabase } from "../db/supabaseClient.js";

export const createReservation = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        const refreshToken = req.headers["x-refresh-token"];
        const { resourceId, startsAt, endsAt, status } = req.body;

        const { data: session, error: authError } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: refreshToken,
        });

        if (authError || !session?.user?.id)
            return res.status(401).json({ error: "Invalid session" });

        const user = session?.user?.id;


        const { data: existing, error: fetchError } = await supabase
            .from("reservation")
            .select("*")
            .eq("resourceId", resourceId)
            .eq("status", "confirmed")
            .or(`and(startsAt.lte.${endsAt},endsAt.gte.${startsAt})`);



        if (existing && existing.length > 0) {
            return res.status(409).json({
                error: "This resource is already reserved during that time.", fetchError,
            });
        }

        const { data, error } = await supabase
            .from("reservation")
            .insert([
                {
                    resourceId,
                    startsAt,
                    endsAt,
                    status,
                    userId: user,
                    status: status,
                },
            ])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getUserReservations = async (req, res) => {
  try {
    // Extract tokens from headers
    const token = req.headers.authorization?.replace("Bearer ", "");
    const refreshToken = req.headers["x-refresh-token"];

    // Validate session
    const { data: session, error: authError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: refreshToken,
    });

    if (authError || !session?.user?.id) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const userId = session.user.id;

    // Fetch reservations for this user
    const { data: reservations, error } = await supabase
      .from("reservation")
      .select("*")
      .eq("userId", userId)
      .order("startsAt", { ascending: true });

    if (error) throw error;

    
    res.status(200).json(reservations);
  } catch (err) {
    console.error("Fetch reservations failed:", err.message);
    res.status(500).json({ error: err.message });
  }
};
