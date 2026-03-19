
CREATE OR REPLACE FUNCTION public.notify_patient_new_prescription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _patient_phone text;
  _patient_name text;
  _user_id uuid;
BEGIN
  IF NEW.patient_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get patient phone and name
  SELECT phone, name INTO _patient_phone, _patient_name
  FROM public.patients WHERE id = NEW.patient_id;

  IF _patient_phone IS NULL THEN
    RETURN NEW;
  END IF;

  -- Find user with matching phone in profiles
  SELECT id INTO _user_id
  FROM public.profiles WHERE phone = _patient_phone LIMIT 1;

  IF _user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Insert notification
  INSERT INTO public.notifications (user_id, clinic_id, title, body, type, reference_id, reference_type)
  VALUES (
    _user_id,
    NEW.clinic_id,
    'وصفة طبية جديدة',
    'تم كتابة وصفة طبية جديدة لك بتاريخ ' || COALESCE(NEW.date::text, CURRENT_DATE::text),
    'prescription',
    NEW.id,
    'prescription'
  );

  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_new_prescription_notify
  AFTER INSERT ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_patient_new_prescription();
