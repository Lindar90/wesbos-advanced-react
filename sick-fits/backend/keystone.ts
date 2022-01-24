import 'dotenv/config';
import { createSchema, config } from '@keystone-next/keystone/schema';
import { createAuth } from '@keystone-next/auth';
import {
  statelessSessions,
  withItemData,
} from '@keystone-next/keystone/session';
import { User } from './schemas/User';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';
import {insertSeedData} from "./seed-data";

const dbUrl = process.env.DATABASE_URL;

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360,
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    // add initial roles
  },
});

export default withAuth(
  config({
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
      },
    },

    db: {
      adapter: 'mongoose',
      url: dbUrl,
      onConnect(keystone) {
        if (process.argv.includes('--seed-data')) {
          return insertSeedData(keystone);
        }
      },
    },

    lists: createSchema({
      // schema items
      User,
      Product,
      ProductImage,
    }),

    ui: {
      // todo role
      isAccessAllowed: ({ session }) => !!session?.data,
    },

    // todo add session values
    session: withItemData(statelessSessions(sessionConfig), {
      User: 'id',
    }),
  })
);
