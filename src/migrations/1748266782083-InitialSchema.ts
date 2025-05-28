import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1748266782083 implements MigrationInterface {
  name = "InitialSchema1748266782083";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "amenity" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "icon" character varying,
                CONSTRAINT "UQ_eedf8a09ca6003f9fced4749b7c" UNIQUE ("name"),
                CONSTRAINT "PK_f981de7b1a822823e5f31da10dc" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "review" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "rating" integer NOT NULL,
                "comment" text NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                "propertyId" uuid,
                CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."property_type_enum" AS ENUM(
                'apartment',
                'house',
                'villa',
                'condominium',
                'townhouse',
                'studio'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "property" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "address" character varying NOT NULL,
                "price" numeric(12, 2) NOT NULL,
                "latitude" numeric(10, 6),
                "longitude" numeric(10, 6),
                "bedrooms" integer NOT NULL,
                "bathrooms" integer NOT NULL,
                "squareMeters" integer NOT NULL,
                "type" "public"."property_type_enum" NOT NULL,
                "images" text NOT NULL,
                "isAvailable" boolean NOT NULL DEFAULT true,
                "isFeatured" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "agentId" uuid,
                CONSTRAINT "PK_d80743e6191258a5003d5843b4f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."payment_method_enum" AS ENUM('mpesa', 'stripe', 'bank_transfer', 'cash')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."payment_status_enum" AS ENUM('pending', 'completed', 'failed', 'refunded')
        `);
    await queryRunner.query(`
            CREATE TABLE "payment" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "amount" numeric(12, 2) NOT NULL,
                "transactionDate" TIMESTAMP NOT NULL,
                "reference" character varying NOT NULL,
                "method" "public"."payment_method_enum" NOT NULL,
                "status" "public"."payment_status_enum" NOT NULL DEFAULT 'pending',
                "paymentDetails" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "bookingId" uuid,
                CONSTRAINT "UQ_4bf2af7227a0562a1fa747298aa" UNIQUE ("reference"),
                CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."invoice_status_enum" AS ENUM('pending', 'paid', 'overdue', 'cancelled')
        `);
    await queryRunner.query(`
            CREATE TABLE "invoice" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "invoiceNumber" character varying NOT NULL,
                "amount" numeric(12, 2) NOT NULL,
                "dueDate" TIMESTAMP NOT NULL,
                "status" "public"."invoice_status_enum" NOT NULL DEFAULT 'pending',
                "notes" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "bookingId" uuid,
                CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."booking_status_enum" AS ENUM(
                'pending',
                'confirmed',
                'active',
                'completed',
                'cancelled'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "booking" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "status" "public"."booking_status_enum" NOT NULL DEFAULT 'pending',
                "startDate" TIMESTAMP NOT NULL,
                "endDate" TIMESTAMP NOT NULL,
                "totalAmount" numeric(12, 2) NOT NULL,
                "specialRequests" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                "propertyId" uuid,
                CONSTRAINT "PK_49171efc69702ed84c812f33540" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "message" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "content" text NOT NULL,
                "isFromBot" boolean NOT NULL DEFAULT false,
                "isRead" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "senderId" uuid,
                "receiverId" uuid,
                CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."maintenance_status_enum" AS ENUM(
                'pending',
                'in_progress',
                'completed',
                'cancelled'
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."maintenance_priority_enum" AS ENUM('low', 'medium', 'high', 'emergency')
        `);
    await queryRunner.query(`
            CREATE TABLE "maintenance" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "status" "public"."maintenance_status_enum" NOT NULL DEFAULT 'pending',
                "priority" "public"."maintenance_priority_enum" NOT NULL DEFAULT 'medium',
                "resolutionNotes" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                "propertyId" uuid,
                CONSTRAINT "PK_542fb6a28537140d2df95faa52a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "auth_provider" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "provider" character varying NOT NULL,
                "providerId" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                CONSTRAINT "PK_0a6e6348fe38ba49160eb903c95" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "session" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "token" character varying NOT NULL,
                "ipAddress" character varying NOT NULL,
                "userAgent" character varying NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM('tenant', 'agent', 'admin')
        `);
    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "fullName" character varying NOT NULL,
                "nationalId" character varying NOT NULL,
                "username" character varying NOT NULL,
                "email" character varying NOT NULL,
                "phoneNumber" character varying NOT NULL,
                "location" character varying NOT NULL,
                "password" text,
                "googleId" character varying,
                "safaricomId" character varying,
                "isVerified" boolean NOT NULL DEFAULT false,
                "passwordChanged" boolean NOT NULL DEFAULT false,
                "passwordResetToken" text,
                "passwordResetExpires" text,
                "role" "public"."user_role_enum" NOT NULL DEFAULT 'tenant',
                "profileImage" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_5e30ae7136bce1f6d80d9c0b72d" UNIQUE ("nationalId"),
                CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "UQ_f2578043e491921209f5dadd080" UNIQUE ("phoneNumber"),
                CONSTRAINT "UQ_470355432cc67b2c470c30bef7c" UNIQUE ("googleId"),
                CONSTRAINT "UQ_1804f5e11b1741361a5f84b2a9a" UNIQUE ("safaricomId"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."notification_type_enum" AS ENUM('booking', 'payment', 'maintenance', 'system')
        `);
    await queryRunner.query(`
            CREATE TABLE "notification" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "message" text NOT NULL,
                "type" "public"."notification_type_enum" NOT NULL,
                "isRead" boolean NOT NULL DEFAULT false,
                "actionUrl" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "property_amenities_amenity" (
                "propertyId" uuid NOT NULL,
                "amenityId" uuid NOT NULL,
                CONSTRAINT "PK_095b2f02026c69c97793c158a39" PRIMARY KEY ("propertyId", "amenityId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d7760c08391960d305d3545527" ON "property_amenities_amenity" ("propertyId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_c69572a61bce15aeded2e1d6ba" ON "property_amenities_amenity" ("amenityId")
        `);
    await queryRunner.query(`
            ALTER TABLE "review"
            ADD CONSTRAINT "FK_1337f93918c70837d3cea105d39" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "review"
            ADD CONSTRAINT "FK_d5fcfc0cc81813136b646d2a5a1" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "property"
            ADD CONSTRAINT "FK_3df22387cc25ecbbe851a57fd32" FOREIGN KEY ("agentId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "payment"
            ADD CONSTRAINT "FK_5738278c92c15e1ec9d27e3a098" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "invoice"
            ADD CONSTRAINT "FK_4243ed673ee504d563c8f812fad" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "booking"
            ADD CONSTRAINT "FK_336b3f4a235460dc93645fbf222" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "booking"
            ADD CONSTRAINT "FK_aaacfb3ddf4c074dc358a9a94a0" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "message"
            ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "message"
            ADD CONSTRAINT "FK_71fb36906595c602056d936fc13" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "maintenance"
            ADD CONSTRAINT "FK_724107291aec48826a8ffe8eaa9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "maintenance"
            ADD CONSTRAINT "FK_3caeae5432c46ba1e8b59f51cf2" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "auth_provider"
            ADD CONSTRAINT "FK_d9255ec09fddab3e47e84fd2a07" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "notification"
            ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "property_amenities_amenity"
            ADD CONSTRAINT "FK_d7760c08391960d305d3545527f" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "property_amenities_amenity"
            ADD CONSTRAINT "FK_c69572a61bce15aeded2e1d6bad" FOREIGN KEY ("amenityId") REFERENCES "amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "property_amenities_amenity" DROP CONSTRAINT "FK_c69572a61bce15aeded2e1d6bad"
        `);
    await queryRunner.query(`
            ALTER TABLE "property_amenities_amenity" DROP CONSTRAINT "FK_d7760c08391960d305d3545527f"
        `);
    await queryRunner.query(`
            ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"
        `);
    await queryRunner.query(`
            ALTER TABLE "auth_provider" DROP CONSTRAINT "FK_d9255ec09fddab3e47e84fd2a07"
        `);
    await queryRunner.query(`
            ALTER TABLE "maintenance" DROP CONSTRAINT "FK_3caeae5432c46ba1e8b59f51cf2"
        `);
    await queryRunner.query(`
            ALTER TABLE "maintenance" DROP CONSTRAINT "FK_724107291aec48826a8ffe8eaa9"
        `);
    await queryRunner.query(`
            ALTER TABLE "message" DROP CONSTRAINT "FK_71fb36906595c602056d936fc13"
        `);
    await queryRunner.query(`
            ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"
        `);
    await queryRunner.query(`
            ALTER TABLE "booking" DROP CONSTRAINT "FK_aaacfb3ddf4c074dc358a9a94a0"
        `);
    await queryRunner.query(`
            ALTER TABLE "booking" DROP CONSTRAINT "FK_336b3f4a235460dc93645fbf222"
        `);
    await queryRunner.query(`
            ALTER TABLE "invoice" DROP CONSTRAINT "FK_4243ed673ee504d563c8f812fad"
        `);
    await queryRunner.query(`
            ALTER TABLE "payment" DROP CONSTRAINT "FK_5738278c92c15e1ec9d27e3a098"
        `);
    await queryRunner.query(`
            ALTER TABLE "property" DROP CONSTRAINT "FK_3df22387cc25ecbbe851a57fd32"
        `);
    await queryRunner.query(`
            ALTER TABLE "review" DROP CONSTRAINT "FK_d5fcfc0cc81813136b646d2a5a1"
        `);
    await queryRunner.query(`
            ALTER TABLE "review" DROP CONSTRAINT "FK_1337f93918c70837d3cea105d39"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_c69572a61bce15aeded2e1d6ba"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_d7760c08391960d305d3545527"
        `);
    await queryRunner.query(`
            DROP TABLE "property_amenities_amenity"
        `);
    await queryRunner.query(`
            DROP TABLE "notification"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."notification_type_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "user"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."user_role_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "session"
        `);
    await queryRunner.query(`
            DROP TABLE "auth_provider"
        `);
    await queryRunner.query(`
            DROP TABLE "maintenance"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."maintenance_priority_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."maintenance_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "message"
        `);
    await queryRunner.query(`
            DROP TABLE "booking"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."booking_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "invoice"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."invoice_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "payment"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."payment_status_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."payment_method_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "property"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."property_type_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "review"
        `);
    await queryRunner.query(`
            DROP TABLE "amenity"
        `);
  }
}
