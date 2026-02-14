-- This is an empty migration.

-- =====================================================
-- 1. USER CREATION TRIGGER
-- Auto-creates wallet + XP + audit log on user signup
-- =====================================================
CREATE OR REPLACE FUNCTION user_after_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Create wallet with initial balance
  INSERT INTO "wallet" ("user_id", "pin", "balance")
  VALUES (NEW.id, '000000', 500.00);

  -- Initialize XP record (level 1)
  INSERT INTO "xp" ("user_id", "xp", "level", "updated_at")
  VALUES (NEW.id, 0, 1, now())
  ON CONFLICT ("user_id") DO NOTHING;

  -- Log user creation
  INSERT INTO "user_logs" ("user_id", "action", "timestamp")
  VALUES (NEW.id, 'User account created', now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_after_insert
  AFTER INSERT ON "user"
  FOR EACH ROW
  EXECUTE FUNCTION user_after_insert();

-- =====================================================
-- 2. PAYMENT SUCCESS TRIGGER  
-- Deducts from wallet + logs transaction on payment success
-- =====================================================
CREATE OR REPLACE FUNCTION payment_success_handler()
RETURNS TRIGGER AS $$
DECLARE
  product_price DECIMAL(10,2);
  new_balance DECIMAL(10,2);
BEGIN
  -- Only trigger on status change to 'success'
  IF OLD.status IS DISTINCT FROM 'success' AND NEW.status = 'success' THEN
    
    -- Get product price
    SELECT price INTO product_price 
    FROM "product" 
    WHERE id = (SELECT "product_id" FROM "order_item" WHERE "order_id" = NEW.id LIMIT 1);

    -- Check wallet balance
    SELECT balance INTO new_balance 
    FROM "wallet" 
    WHERE "user_id" = NEW."user_id";

    IF new_balance < product_price THEN
      RAISE EXCEPTION 'Insufficient wallet balance: %. Required: %', new_balance, product_price;
    END IF;

    -- Atomic wallet deduction
    UPDATE "wallet" 
    SET balance = balance - product_price
    WHERE "user_id" = NEW."user_id";

    -- Log transaction
    INSERT INTO "transaction_history" (
      "user_id", 
      amount, 
      type, 
      status, 
      note
    ) VALUES (
      NEW."user_id",
      product_price,
      'debit',
      'success',
      'Order #' || NEW.id
    );

    -- Log purchase
    INSERT INTO "user_logs" ("user_id", "action")
    VALUES (NEW."user_id", 'Purchase completed: Order #' || NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_success
  AFTER UPDATE OF status ON "order"
  FOR EACH ROW
  EXECUTE FUNCTION payment_success_handler();

-- =====================================================
-- 3. WALLET BALANCE PROTECTION
-- Prevents negative wallet balances
-- =====================================================
CREATE OR REPLACE FUNCTION wallet_balance_protection()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.balance < 0 THEN
    RAISE EXCEPTION 'Insufficient wallet balance: cannot go below 0. Current: %', NEW.balance;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wallet_balance_check
  BEFORE UPDATE OF balance ON "wallet"
  FOR EACH ROW
  EXECUTE FUNCTION wallet_balance_protection();

-- =====================================================
-- 4. XP → LEVEL-UP TRIGGER
-- Auto-levels up when XP crosses thresholds
-- =====================================================
CREATE OR REPLACE FUNCTION xp_level_up()
RETURNS TRIGGER AS $$
DECLARE
  new_level INT;
  old_level INT;
  messages TEXT[] := ARRAY[
    '🎉 Level up! You reached Level ',
    '🚀 Incredible! Welcome to Level ',
    '🌟 You just unlocked Level ',
    '👑 Level achieved! Now Level ',
    '⚡ Power level increased to '
  ];
BEGIN
  -- Only trigger on XP increase
  IF NEW.xp > OLD.xp THEN
    -- Find new level based on XP
    SELECT "levelNumber" INTO new_level
    FROM "level"
    WHERE requiredXp <= NEW.xp
    ORDER BY "levelNumber" DESC
    LIMIT 1;

    old_level := COALESCE(OLD.level, 1);
    
    -- Level up occurred
    IF new_level > old_level THEN
      UPDATE "xp" 
      SET level = new_level
      WHERE "user_id" = NEW."user_id";

      -- Log with random message
      INSERT INTO "user_logs" ("user_id", "action")
      VALUES (
        NEW."user_id", 
        messages[1 + (EXTRACT(EPOCH FROM clock_timestamp())::INT % array_length(messages,1))] || new_level
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_xp_level_up
  AFTER UPDATE OF xp ON "xp"
  FOR EACH ROW
  EXECUTE FUNCTION xp_level_up();

-- =====================================================
-- 5. XP GAIN LOGGING
-- Logs all XP gains with delta
-- =====================================================
CREATE OR REPLACE FUNCTION xp_gain_logger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.xp > OLD.xp THEN
    INSERT INTO "user_logs" (
      "user_id", 
      "action", 
      "timestamp"
    ) VALUES (
      NEW."user_id",
      format('Gained %s XP (Total: %s)', NEW.xp - OLD.xp, NEW.xp)::VARCHAR(255),
      now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_xp_gain_log
  AFTER UPDATE OF xp ON "xp"
  FOR EACH ROW
  WHEN (NEW.xp > OLD.xp)
  EXECUTE FUNCTION xp_gain_logger();

-- =====================================================
-- 6. SENSITIVE USER UPDATE AUDIT
-- Tracks critical field changes
-- =====================================================
CREATE OR REPLACE FUNCTION user_sensitive_audit()
RETURNS TRIGGER AS $$
DECLARE
  audit_msg TEXT := '';
BEGIN
  -- Track only sensitive field changes
  IF OLD.email != NEW.email THEN
    audit_msg := audit_msg || 'Email: ' || OLD.email || ' → ' || NEW.email || '; ';
  END IF;
  
  IF OLD.type != NEW.type THEN
    audit_msg := audit_msg || 'Role: ' || OLD.type || ' → ' || NEW.type || '; ';
  END IF;
  
  IF COALESCE(OLD.college_id, 0) != COALESCE(NEW.college_id, 0) THEN
    audit_msg := audit_msg || 'CollegeID: ' || OLD.college_id || ' → ' || NEW.college_id || '; ';
  END IF;

  -- Log if any changes detected
  IF LENGTH(audit_msg) > 0 THEN
    INSERT INTO "user_logs" (
      "user_id", 
      "action"
    ) VALUES (
      NEW.id,
      'Sensitive update: ' || RTRIM(audit_msg, '; ')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_sensitive_audit
  AFTER UPDATE OF email, type, college_id ON "user"
  FOR EACH ROW
  EXECUTE FUNCTION user_sensitive_audit();
