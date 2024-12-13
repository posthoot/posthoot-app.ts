
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.0.1
 * Query Engine version: 5dbef10bdbfb579e07d35cc85fb1518d357cb99e
 */
Prisma.prismaVersion = {
  client: "6.0.1",
  engine: "5dbef10bdbfb579e07d35cc85fb1518d357cb99e"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.EmailTemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  subject: 'subject',
  content: 'content',
  variables: 'variables',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  teamId: 'teamId',
  categoryId: 'categoryId',
  html: 'html',
  design: 'design'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  password: 'password',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  status: 'status',
  teamId: 'teamId'
};

exports.Prisma.TeamScalarFieldEnum = {
  id: 'id',
  name: 'name',
  logoUrl: 'logoUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  emailTemplateId: 'emailTemplateId'
};

exports.Prisma.TeamInviteScalarFieldEnum = {
  id: 'id',
  teamId: 'teamId',
  inviterId: 'inviterId',
  status: 'status',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  email: 'email',
  name: 'name'
};

exports.Prisma.ApiKeyScalarFieldEnum = {
  id: 'id',
  name: 'name',
  key: 'key',
  teamId: 'teamId',
  lastUsedAt: 'lastUsedAt',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  scopes: 'scopes',
  rateLimit: 'rateLimit',
  isActive: 'isActive'
};

exports.Prisma.ApiKeyUsageScalarFieldEnum = {
  id: 'id',
  apiKeyId: 'apiKeyId',
  endpoint: 'endpoint',
  method: 'method',
  timestamp: 'timestamp',
  success: 'success',
  error: 'error',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent'
};

exports.Prisma.CampaignScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  templateId: 'templateId',
  teamId: 'teamId',
  status: 'status',
  scheduledFor: 'scheduledFor',
  schedule: 'schedule',
  listId: 'listId',
  recurringSchedule: 'recurringSchedule',
  cronExpression: 'cronExpression',
  smtpConfigId: 'smtpConfigId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MailingListScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  teamId: 'teamId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubscriberScalarFieldEnum = {
  id: 'id',
  email: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
  phone: 'phone',
  company: 'company',
  title: 'title',
  address: 'address',
  addressLine2: 'addressLine2',
  city: 'city',
  state: 'state',
  postalCode: 'postalCode',
  country: 'country',
  metadata: 'metadata',
  tags: 'tags',
  customFields: 'customFields',
  source: 'source',
  listId: 'listId',
  status: 'status',
  unsubscribedAt: 'unsubscribedAt',
  lastActivityAt: 'lastActivityAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SentEmailScalarFieldEnum = {
  id: 'id',
  templateId: 'templateId',
  campaignId: 'campaignId',
  recipient: 'recipient',
  subject: 'subject',
  content: 'content',
  status: 'status',
  sentAt: 'sentAt',
  openedAt: 'openedAt',
  clickedAt: 'clickedAt',
  teamId: 'teamId',
  error: 'error',
  metadata: 'metadata',
  jobId: 'jobId',
  subscriberId: 'subscriberId'
};

exports.Prisma.EmailTrackingScalarFieldEnum = {
  id: 'id',
  sentEmailId: 'sentEmailId',
  type: 'type',
  createdAt: 'createdAt'
};

exports.Prisma.EmailJobScalarFieldEnum = {
  id: 'id',
  campaignId: 'campaignId',
  status: 'status',
  totalEmails: 'totalEmails',
  processedEmails: 'processedEmails',
  startedAt: 'startedAt',
  completedAt: 'completedAt',
  error: 'error',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmailJobLogScalarFieldEnum = {
  id: 'id',
  jobId: 'jobId',
  level: 'level',
  message: 'message',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.CampaignAnalyticsScalarFieldEnum = {
  id: 'id',
  campaignId: 'campaignId',
  sentCount: 'sentCount',
  openCount: 'openCount',
  clickCount: 'clickCount',
  bounceCount: 'bounceCount',
  unsubscribeCount: 'unsubscribeCount',
  lastUpdated: 'lastUpdated'
};

exports.Prisma.EmailCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SmtpConfigScalarFieldEnum = {
  id: 'id',
  provider: 'provider',
  host: 'host',
  port: 'port',
  username: 'username',
  password: 'password',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  teamId: 'teamId'
};

exports.Prisma.AutomationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isActive: 'isActive',
  teamId: 'teamId'
};

exports.Prisma.AutomationNodeScalarFieldEnum = {
  id: 'id',
  automationId: 'automationId',
  type: 'type',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  data: 'data'
};

exports.Prisma.AutomationNodeEdgeScalarFieldEnum = {
  id: 'id',
  automationId: 'automationId',
  sourceId: 'sourceId',
  targetId: 'targetId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  label: 'label',
  animated: 'animated'
};

exports.Prisma.CustomDomainScalarFieldEnum = {
  id: 'id',
  domain: 'domain',
  sslStatus: 'sslStatus',
  sslCertificate: 'sslCertificate',
  sslPrivateKey: 'sslPrivateKey',
  sslExpiresAt: 'sslExpiresAt',
  verificationToken: 'verificationToken',
  dnsChallenge: 'dnsChallenge',
  dnsChallengeToken: 'dnsChallengeToken',
  isVerified: 'isVerified',
  isActive: 'isActive',
  teamId: 'teamId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.UserRole = exports.$Enums.UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER'
};

exports.UserStatus = exports.$Enums.UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

exports.InviteStatus = exports.$Enums.InviteStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED'
};

exports.CampaignStatus = exports.$Enums.CampaignStatus = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  SENDING: 'SENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  PAUSED: 'PAUSED'
};

exports.CampaignSchedule = exports.$Enums.CampaignSchedule = {
  ONE_TIME: 'ONE_TIME',
  RECURRING: 'RECURRING'
};

exports.CampaignRecurringSchedule = exports.$Enums.CampaignRecurringSchedule = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  CUSTOM: 'CUSTOM'
};

exports.SubscriberStatus = exports.$Enums.SubscriberStatus = {
  ACTIVE: 'ACTIVE',
  UNSUBSCRIBED: 'UNSUBSCRIBED',
  BOUNCED: 'BOUNCED',
  COMPLAINED: 'COMPLAINED'
};

exports.EmailStatus = exports.$Enums.EmailStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
  BOUNCED: 'BOUNCED',
  OPENED: 'OPENED',
  CLICKED: 'CLICKED'
};

exports.TrackingType = exports.$Enums.TrackingType = {
  CLICKED: 'CLICKED',
  OPENED: 'OPENED',
  BOUNCED: 'BOUNCED',
  FAILED: 'FAILED'
};

exports.JobStatus = exports.$Enums.JobStatus = {
  QUEUED: 'QUEUED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

exports.LogLevel = exports.$Enums.LogLevel = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR'
};

exports.NodeType = exports.$Enums.NodeType = {
  START: 'START',
  EMAIL: 'EMAIL',
  WAIT: 'WAIT',
  CONDITION: 'CONDITION',
  WEBHOOK: 'WEBHOOK',
  ADD_TO_LIST: 'ADD_TO_LIST',
  REMOVE_FROM_LIST: 'REMOVE_FROM_LIST',
  UPDATE_SUBSCRIBER: 'UPDATE_SUBSCRIBER',
  CHECK_ENGAGEMENT: 'CHECK_ENGAGEMENT',
  SEGMENT: 'SEGMENT',
  TAG: 'TAG',
  UNSUBSCRIBE: 'UNSUBSCRIBE',
  CUSTOM_CODE: 'CUSTOM_CODE',
  EXIT: 'EXIT'
};

exports.Prisma.ModelName = {
  EmailTemplate: 'EmailTemplate',
  User: 'User',
  Team: 'Team',
  TeamInvite: 'TeamInvite',
  ApiKey: 'ApiKey',
  ApiKeyUsage: 'ApiKeyUsage',
  Campaign: 'Campaign',
  MailingList: 'MailingList',
  Subscriber: 'Subscriber',
  SentEmail: 'SentEmail',
  EmailTracking: 'EmailTracking',
  EmailJob: 'EmailJob',
  EmailJobLog: 'EmailJobLog',
  CampaignAnalytics: 'CampaignAnalytics',
  EmailCategory: 'EmailCategory',
  SmtpConfig: 'SmtpConfig',
  Automation: 'Automation',
  AutomationNode: 'AutomationNode',
  AutomationNodeEdge: 'AutomationNodeEdge',
  CustomDomain: 'CustomDomain'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
