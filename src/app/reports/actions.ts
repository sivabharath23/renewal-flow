'use server';

import db from '@/lib/db';
import { getUserFilter } from '@/lib/auth-helpers';

export async function getRevenueReport(startDateStr?: string, endDateStr?: string) {
  try {
    const filter = await getUserFilter();
    if (!filter) return [];

    const start = startDateStr ? new Date(startDateStr) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDateStr ? new Date(endDateStr) : new Date();

    const invoices = await db.invoice.findMany({
      where: {
        ...filter,
        status: 'PAID',
        updatedAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        client: true,
        project: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return invoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      companyName: inv.client.companyName,
      projectName: inv.project.projectName,
      amount: inv.amount,
      paidDate: inv.updatedAt,
    }));
  } catch (error) {
    console.error('Failed to get revenue report:', error);
    return [];
  }
}

export async function getClientReport() {
  try {
    const filter = await getUserFilter();
    if (!filter) return [];

    const clients = await db.client.findMany({
      where: filter,
      include: {
        projects: {
          include: {
            invoices: {
              where: { status: 'PAID' },
              select: { amount: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return clients.map((c) => {
      let totalSpent = 0;
      c.projects.forEach((proj) => {
        proj.invoices.forEach((inv) => {
          totalSpent += inv.amount;
        });
      });

      return {
        clientName: c.name,
        companyName: c.companyName,
        email: c.email,
        phone: c.phone,
        totalProjects: c.projects.length,
        totalSpent,
      };
    });
  } catch (error) {
    console.error('Failed to get client report:', error);
    return [];
  }
}

export async function getDomainReport(startDateStr?: string, endDateStr?: string) {
  try {
    const filter = await getUserFilter();
    if (!filter) return [];

    const start = startDateStr ? new Date(startDateStr) : new Date();
    const end = endDateStr ? new Date(endDateStr) : new Date(new Date().getFullYear(), new Date().getMonth() + 12, 1);

    const domains = await db.domain.findMany({
      where: {
        ...filter,
        expiryDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        project: {
          include: { client: true },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    return domains.map((d) => ({
      domainName: d.domainName,
      companyName: d.project.client.companyName,
      projectName: d.project.projectName,
      registrar: d.registrar,
      expiryDate: d.expiryDate,
      renewalAmount: d.renewalAmount,
      status: d.status,
    }));
  } catch (error) {
    console.error('Failed to get domain report:', error);
    return [];
  }
}

export async function getServerReport(startDateStr?: string, endDateStr?: string) {
  try {
    const filter = await getUserFilter();
    if (!filter) return [];

    const start = startDateStr ? new Date(startDateStr) : new Date();
    const end = endDateStr ? new Date(endDateStr) : new Date(new Date().getFullYear(), new Date().getMonth() + 12, 1);

    const servers = await db.server.findMany({
      where: {
        ...filter,
        expiryDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        project: {
          include: { client: true },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    return servers.map((s) => ({
      provider: s.provider,
      planName: s.planName,
      ipAddress: s.ipAddress,
      projectName: s.project.projectName,
      companyName: s.project.client.companyName,
      expiryDate: s.expiryDate,
      amount: s.amount,
    }));
  } catch (error) {
    console.error('Failed to get server report:', error);
    return [];
  }
}

export async function getAMCReport(startDateStr?: string, endDateStr?: string) {
  try {
    const filter = await getUserFilter();
    if (!filter) return [];

    const start = startDateStr ? new Date(startDateStr) : new Date();
    const end = endDateStr ? new Date(endDateStr) : new Date(new Date().getFullYear(), new Date().getMonth() + 12, 1);

    const amcs = await db.aMCContract.findMany({
      where: {
        ...filter,
        endDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        project: {
          include: { client: true },
        },
      },
      orderBy: { endDate: 'asc' },
    });

    return amcs.map((a) => ({
      projectName: a.project.projectName,
      companyName: a.project.client.companyName,
      startDate: a.startDate,
      endDate: a.endDate,
      renewalCycle: a.renewalCycle,
      amount: a.amount,
      status: a.status,
    }));
  } catch (error) {
    console.error('Failed to get AMC report:', error);
    return [];
  }
}

export async function getPendingPaymentsReport() {
  try {
    const filter = await getUserFilter();
    if (!filter) return [];

    const invoices = await db.invoice.findMany({
      where: {
        ...filter,
        status: 'PENDING',
      },
      include: {
        client: true,
        project: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    return invoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      companyName: inv.client.companyName,
      projectName: inv.project.projectName,
      dueDate: inv.dueDate,
      amount: inv.amount,
    }));
  } catch (error) {
    console.error('Failed to get pending payments report:', error);
    return [];
  }
}
