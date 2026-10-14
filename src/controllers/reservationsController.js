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

    const normalized = reservations.map(r => ({
      id: r.id,
      userId: r.userId,              // not user_id
      resourceId: r.resourceId,      // not resource_id
      startsAt: r.startsAt,
      endsAt: r.endsAt,
      status: r.status,
    }));
    
    res.status(200).json(normalized);
  } catch (err) {
    console.error("Fetch reservations failed:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const refreshToken = req.headers["x-refresh-token"];
    const { reservationId } = req.body;

    // Validate session
    const { data: session, error: authError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: refreshToken,
    });

    if (authError || !session?.user?.id) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const userId = session.user.id;

    // Ensure reservation exists and belongs to this user
    const { data: existing, error: fetchError } = await supabase
      .from("reservation")
      .select("*")
      .eq("id", reservationId)
      .eq("userId", userId)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Validate cancellation rules
    if (
      existing.status !== "confirmed" ||
      Date.parse(existing.startsAt) <= Date.now()
    ) {
      return res.status(400).json({
        error: "Only confirmed reservations that have not started can be cancelled.",
      });
    }

    // Update status
    const { data, error } = await supabase
      .from("reservation")
      .update({ status: "cancelled" })
      .eq("id", reservationId)
      .eq("userId", userId)
      .select();

    if (error) throw error;

    res.status(200).json(data[0]);
  } catch (err) {
    console.error("Cancel reservation failed:", err.message);
    res.status(500).json({ error: err.message });
  }
};