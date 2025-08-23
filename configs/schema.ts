// import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
// export const usersTable = pgTable("users", {
//     id: integer().primaryKey().generatedAlwaysAsIdentity(),
//     name: varchar({ length: 255 }).notNull(),
//     email: varchar({ length: 255 }).notNull().unique(),
//     credits: integer().default(0)
// });



// import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";

// export const usersTable = pgTable("users", {
//   id: serial("id").primaryKey(),
//   name: text("name"),
//   email: text("email").notNull().unique(),
//   credits: integer("credits").default(0),
// });


