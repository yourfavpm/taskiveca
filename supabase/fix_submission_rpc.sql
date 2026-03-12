-- RPC for safe consultation submission
-- This allows public insertion and returns the generated ID without requiring table SELECT permissions.

CREATE OR REPLACE FUNCTION public.submit_consultation(
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT DEFAULT NULL,
    p_company TEXT DEFAULT NULL,
    p_website TEXT DEFAULT NULL,
    p_country TEXT DEFAULT NULL,
    p_project_type TEXT DEFAULT NULL,
    p_estimated_start_time TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_preferred_date DATE DEFAULT NULL,
    p_preferred_time TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as postgres, bypassing RLS for the insert
SET search_path = public
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO consultations (
        name, email, phone, company, website, country, 
        project_type, estimated_start_time, description,
        preferred_date, preferred_time
    )
    VALUES (
        p_name, p_email, p_phone, p_company, p_website, p_country,
        p_project_type, p_estimated_start_time, p_description,
        p_preferred_date, p_preferred_time
    )
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$;

-- Grant access to anyone (anon and authenticated)
GRANT EXECUTE ON FUNCTION public.submit_consultation TO anon, authenticated;
