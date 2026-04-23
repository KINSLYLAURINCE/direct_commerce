const { query } = require('./database');

const initDb = async () => {
  try {
    await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await query(`
      CREATE TABLE IF NOT EXISTS public.roles (
        id uuid DEFAULT uuid_generate_v4() NOT NULL,
        name VARCHAR(50) NOT NULL,
        CONSTRAINT roles_pkey PRIMARY KEY (id),
        CONSTRAINT roles_name_key UNIQUE (name)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id uuid DEFAULT uuid_generate_v4() NOT NULL,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role_id uuid,
        two_factor_secret VARCHAR(255),
        two_factor_enabled BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT users_pkey PRIMARY KEY (id),
        CONSTRAINT users_email_key UNIQUE (email),
        CONSTRAINT users_username_key UNIQUE (username),
        CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS public.categories (
        id uuid DEFAULT uuid_generate_v4() NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        quantity INT DEFAULT 0,
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT categories_pkey PRIMARY KEY (id),
        CONSTRAINT categories_name_key UNIQUE (name)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS public.products (
        id uuid DEFAULT uuid_generate_v4() NOT NULL,
        name VARCHAR(255) NOT NULL,
        description_title VARCHAR(255),
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        sold_price NUMERIC(10,2),
        tag VARCHAR(50),
        category_id uuid,
        main_image VARCHAR(255),
        sub_images JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT products_pkey PRIMARY KEY (id),
        CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) 
          REFERENCES public.categories(id) ON DELETE SET NULL
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS public.contact_messages (
        id uuid DEFAULT uuid_generate_v4() NOT NULL,
        name VARCHAR(100) NOT NULL,
        surname VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT contact_messages_pkey PRIMARY KEY (id)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
        id uuid DEFAULT uuid_generate_v4() NOT NULL,
        email VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id),
        CONSTRAINT newsletter_subscribers_email_key UNIQUE (email)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS public.token_blacklist (
        id uuid DEFAULT uuid_generate_v4() NOT NULL,
        token TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT token_blacklist_pkey PRIMARY KEY (id)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS public.whatsapp_inquiries (
        id uuid DEFAULT uuid_generate_v4() NOT NULL,
        name VARCHAR(100) NOT NULL,
        surname VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        country_code VARCHAR(5) NOT NULL,
        country VARCHAR(100) NOT NULL,
        town VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        product_id uuid,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT whatsapp_inquiries_pkey PRIMARY KEY (id),
        CONSTRAINT whatsapp_inquiries_product_id_fkey FOREIGN KEY (product_id) 
          REFERENCES public.products(id) ON DELETE SET NULL
      );
    `);

    await query(`
      INSERT INTO public.roles (id, name) VALUES 
        ('e0943a92-7213-480d-8fd1-d3b37c1b2432', 'admin'),
        ('62b076ca-11ec-4731-bced-4283d3b7f708', 'user')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('✅ Tables initialisées avec succès');
  } catch (err) {
    console.error('❌ Erreur initDb:', err.message);
  }
};

module.exports = initDb;