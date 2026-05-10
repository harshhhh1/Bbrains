import prisma from '../../utils/prisma.js';

const feePerStudentKeys = [
    'ANNUAL_STUDENT_FEE',
    'STUDENT_FEE',
    'FEE_PER_STUDENT',
    'TUITION_FEE',
    'ANNUAL_FEE_PER_STUDENT',
];

const receivedIncomeKeys = [
    'TOTAL_FEES_RECEIVED',
    'FEES_RECEIVED',
    'TOTAL_INCOME_RECEIVED',
    'RECEIVED_INCOME',
];

const salaryPaidKeys = [
    'TOTAL_SALARY_PAID',
    'SALARY_PAID',
    'PAYROLL_PAID',
];

const currencyKeys = ['CURRENCY', 'CURRENCY_CODE'];
const feeNoteKeywords = ['fee', 'fees', 'tuition', 'admission'];
const salaryNoteKeywords = ['salary', 'payroll', 'stipend', 'wage', 'wages'];
const incomeNoteKeywords = ['salary', 'income', 'allowance', 'commission', 'payout', 'payment'];

function parseConfigValue(config) {
    if (!config) return null;

    switch (config.type) {
        case 'number':
            return Number(config.value);
        case 'boolean':
            return config.value === 'true';
        case 'json':
            try {
                return JSON.parse(config.value);
            } catch {
                return config.value;
            }
        default:
            return config.value;
    }
}

function firstDefinedConfig(configMap, keys, fallback = null) {
    for (const key of keys) {
        if (configMap.has(key)) {
            const value = parseConfigValue(configMap.get(key));
            if (value !== null && value !== undefined && value !== '') {
                return value;
            }
        }
    }
    return fallback;
}

function formatAddress(address) {
    if (!address) return null;

    return [
        address.addressLine1,
        address.addressLine2,
        address.city,
        address.state,
        address.postalCode,
        address.country,
    ]
        .filter(Boolean)
        .join(', ');
}

function buildNoteFilters(keywords) {
    return keywords.map((keyword) => ({
        note: {
            contains: keyword,
            mode: 'insensitive',
        },
    }));
}

function buildTransactionSignalFilters(category, legacyKeywords = []) {
    return [
        {
            category,
        },
        ...buildNoteFilters(legacyKeywords),
    ];
}

function toPlainNumber(value, fallback = 0) {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'bigint') return Number(value);
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
}

async function getCustomRoleNames(userId) {
    const roles = await prisma.userRoles.findMany({
        where: { userId },
        select: {
            role: {
                select: {
                    name: true,
                },
            },
        },
    });

    return roles
        .map((entry) => entry.role?.name)
        .filter(Boolean);
}

function calculateStreak(claims) {
    if (!claims || !Array.isArray(claims) || claims.length === 0) return 0;

    const sortedClaims = [...claims].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    let streak = 0;
    const currentDateRef = new Date(now);
    currentDateRef.setHours(0, 0, 0, 0);

    for (const claim of sortedClaims) {
        const claimDate = new Date(claim.createdAt);
        claimDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((currentDateRef - claimDate) / oneDay);

        if (diffDays === streak) {
            streak++;
        } else if (diffDays > streak) {
            break;
        }
    }

    return streak;
}

export {
    feePerStudentKeys,
    receivedIncomeKeys,
    salaryPaidKeys,
    currencyKeys,
    feeNoteKeywords,
    salaryNoteKeywords,
    incomeNoteKeywords,
    parseConfigValue,
    firstDefinedConfig,
    formatAddress,
    buildNoteFilters,
    buildTransactionSignalFilters,
    toPlainNumber,
    getCustomRoleNames,
    calculateStreak
};