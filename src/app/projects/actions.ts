'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getUserFilter, getSessionUser } from '@/lib/auth-helpers';

export async function getProjects(searchQuery?: string, page?: number, limit?: number) {
  try {
    const filter = await getUserFilter();
    if (!filter) return page !== undefined ? { data: [], total: 0, pages: 0 } : [];

    const whereClause = {
      ...filter,
      ...(searchQuery
        ? {
            OR: [
              { projectName: { contains: searchQuery } },
              { client: { name: { contains: searchQuery } } },
              { client: { companyName: { contains: searchQuery } } },
            ],
          }
        : {}),
    };

    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      const [total, data] = await Promise.all([
        db.project.count({ where: whereClause }),
        db.project.findMany({
          where: whereClause,
          include: {
            client: true,
            _count: {
              select: {
                domains: true,
                servers: true,
                amcContracts: true,
                invoices: true,
              },
            },
          },
          orderBy: { projectName: 'asc' },
          skip,
          take: limit,
        })
      ]);
      return {
        data,
        total,
        pages: Math.ceil(total / limit),
      };
    }

    return await db.project.findMany({
      where: whereClause,
      include: {
        client: true,
        _count: {
          select: {
            domains: true,
            servers: true,
            amcContracts: true,
            invoices: true,
          },
        },
      },
      orderBy: { projectName: 'asc' },
    });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return page !== undefined ? { data: [], total: 0, pages: 0 } : [];
  }
}

export async function createProjectAction(formData: FormData) {
  const projectName = formData.get('projectName') as string;
  const clientId = formData.get('clientId') as string;
  const description = formData.get('description') as string || null;
  const status = formData.get('status') as string;

  if (!projectName || !clientId || !status) {
    return { error: 'Project Name, Client, and Status are required.' };
  }

  try {
    const user = await getSessionUser();
    if (!user) return { error: 'Unauthorized' };

    const filter = await getUserFilter();
    if (!filter) return { error: 'Unauthorized' };

    // Verify client belongs to user
    const clientExists = await db.client.findFirst({
      where: { id: clientId, ...filter },
    });
    if (!clientExists) {
      return { error: 'Invalid client selected.' };
    }

    await db.project.create({
      data: {
        projectName,
        clientId,
        description,
        status,
        userId: user.id,
      },
    });
    revalidatePath('/projects');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Create project error:', error);
    return { error: 'Failed to create project. Please try again.' };
  }
}

export async function updateProjectAction(id: string, formData: FormData) {
  const projectName = formData.get('projectName') as string;
  const clientId = formData.get('clientId') as string;
  const description = formData.get('description') as string || null;
  const status = formData.get('status') as string;

  if (!projectName || !clientId || !status) {
    return { error: 'Project Name, Client, and Status are required.' };
  }

  try {
    const filter = await getUserFilter();
    if (!filter) return { error: 'Unauthorized' };

    // Verify project belongs to user
    const projectExists = await db.project.findFirst({
      where: { id, ...filter },
    });
    if (!projectExists) {
      return { error: 'Project not found or unauthorized.' };
    }

    // Verify new client belongs to user
    const clientExists = await db.client.findFirst({
      where: { id: clientId, ...filter },
    });
    if (!clientExists) {
      return { error: 'Invalid client selected.' };
    }

    await db.project.update({
      where: { id },
      data: { projectName, clientId, description, status },
    });
    revalidatePath('/projects');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Update project error:', error);
    return { error: 'Failed to update project. Please try again.' };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    const filter = await getUserFilter();
    if (!filter) return { error: 'Unauthorized' };

    // Verify project belongs to user
    const projectExists = await db.project.findFirst({
      where: { id, ...filter },
    });
    if (!projectExists) {
      return { error: 'Project not found or unauthorized.' };
    }

    await db.project.delete({
      where: { id },
    });
    revalidatePath('/projects');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Delete project error:', error);
    return { error: 'Failed to delete project. Make sure it has no dependencies.' };
  }
}
