import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import {PrismaClient} from '@prisma/client';
import * as PrismaModule from '@prisma/client';
import {Database, Resource, getModelByName} from '@adminjs/prisma';

AdminJS.registerAdapter({Database, Resource});

const prisma = new PrismaClient();

export const buildAdmin = () => {
    console.log('⏳ AdminJS init start...');
    const admin = new AdminJS({
        resources: [
            {
                resource: {model: getModelByName('users', PrismaModule), client: prisma},
                options: {navigation: {name: 'Користувачі'}},
            },
            {
                resource: {model: getModelByName('messages', PrismaModule), client: prisma},
                options: {navigation: {name: 'Повідомлення'}},
            },
            {
                resource: {model: getModelByName('reply_templates', PrismaModule), client: prisma},
                options: {navigation: {name: 'AI'}},
            },
            {
                resource: {model: getModelByName('ai_suggestions', PrismaModule), client: prisma},
                options: {navigation: {name: 'AI'}},
            },
            {
                resource: {model: getModelByName('ai_analytics', PrismaModule), client: prisma},
                options: {navigation: {name: 'AI'}},
            },
        ],
        branding: {companyName: 'Messenger Admin'},
    });
    console.log('✅ AdminJS instance created');
    const router = AdminJSExpress.buildRouter(admin);
    console.log('✅ AdminJS router built');
    return {admin, router};
};