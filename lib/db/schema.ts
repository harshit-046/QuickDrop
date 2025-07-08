import {pgTable, uuid, text, integer, boolean, timestamp} from 'drizzle-orm/pg-core'
import {relations} from 'drizzle-orm'



export const files = pgTable("files",{
    id: uuid("id").defaultRandom().primaryKey(),
    //filr/folder info
    name: text("name").notNull(),
    path: text("path").notNull(),  //document/project/resume.pdf
    size: integer("size").notNull(),
    type: text("type").notNull(),  //folder
    //storage info
    fileUrl: text("file_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    //Owership info
    userId: text("user_id").notNull(),
    parentId: uuid("parent_id"), //parent folder id 
    //file/folder flag
    isFolder: boolean("is_folder").default(false).notNull(),
    isStarred: boolean("is_starred").default(false).notNull(),
    isTrash: boolean("is_trash").default(false).notNull(),
    //timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const filesRelation = relations(files, ({one,many}) => ({
    parent: one(files,{  // parent: Each file/folder can have one parent folder
        fields: [files.parentId],
        references: [files.id]
    }),

    // relationship to child file/folder
    children: many(files)               // children: each folder can have many child files/folder
}));

//type definitions

export const File = typeof files.$inferSelect;
export const newFile = typeof files.$inferInsert;