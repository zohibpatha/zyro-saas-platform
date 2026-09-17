CREATE OR REPLACE FUNCTION update_restaurant_magic(
  p_slug text,
  p_name text,
  p_business_type text,
  p_logo_url text,
  p_cover_image text,
  p_instagram_url text,
  p_google_maps_url text,
  p_google_review_url text,
  p_website_url text,
  p_phone text,
  p_whatsapp text,
  p_address text,
  p_primary_color text
) RETURNS void AS $\$
BEGIN
  UPDATE public.restaurants
  SET
    name = p_name,
    business_type = p_business_type,
    logo_url = p_logo_url,
    cover_image = p_cover_image,
    instagram_url = p_instagram_url,
    google_maps_url = p_google_maps_url,
    google_review_url = p_google_review_url,
    website_url = p_website_url,
    phone = p_phone,
    whatsapp = p_whatsapp,
    address = p_address,
    primary_color = p_primary_color
  WHERE slug = p_slug;
END;
$\$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_food_photo_magic(
  p_slug text,
  p_image_url text
) RETURNS jsonb AS $\$
DECLARE
  v_restaurant_id uuid;
  v_photo jsonb;
BEGIN
  SELECT id INTO v_restaurant_id FROM public.restaurants WHERE slug = p_slug;
  IF v_restaurant_id IS NULL THEN
    RAISE EXCEPTION 'Restaurant not found';
  END IF;

  INSERT INTO public.food_photos (restaurant_id, image_url, sort_order)
  VALUES (v_restaurant_id, p_image_url, 0)
  RETURNING row_to_json(food_photos.*)::jsonb INTO v_photo;

  RETURN v_photo;
END;
$\$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION delete_food_photo_magic(
  p_photo_id uuid,
  p_slug text
) RETURNS void AS $\$
DECLARE
  v_restaurant_id uuid;
BEGIN
  SELECT id INTO v_restaurant_id FROM public.restaurants WHERE slug = p_slug;
  
  DELETE FROM public.food_photos
  WHERE id = p_photo_id AND restaurant_id = v_restaurant_id;
END;
$\$ LANGUAGE plpgsql SECURITY DEFINER;
