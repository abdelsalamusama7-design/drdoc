
CREATE OR REPLACE FUNCTION public.notify_patient_new_file()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _patient_phone text;
  _patient_name text;
  _user_id uuid;
  _file_type_label text;
BEGIN
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

  -- Determine file type label
  _file_type_label := CASE NEW.file_type
    WHEN 'lab' THEN 'نتيجة تحليل جديدة'
    WHEN 'radiology' THEN 'نتيجة أشعة جديدة'
    ELSE 'ملف جديد'
  END;

  -- Insert notification
  INSERT INTO public.notifications (user_id, clinic_id, title, body, type, reference_id, reference_type)
  VALUES (
    _user_id,
    NEW.clinic_id,
    _file_type_label,
    'تم إضافة ' || _file_type_label || ': ' || NEW.file_name,
    'patient_file',
    NEW.id,
    'patient_file'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_patient_new_file
  AFTER INSERT ON public.patient_files
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_patient_new_file();
