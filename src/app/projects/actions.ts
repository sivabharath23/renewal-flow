'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getProjects(searchQuery?: string) {
  try {
    return await db.project.findMany({
      where: searchQuery
        ? {
            OR: [
              { projectName: { contains: searchQuery } },
              { client: { name: { contains: searchQuery } } },
              { client: { companyName: { contains: searchQuery } } },
            ],
          }
        : undefined,
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
    return [];
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
    await db.project.create({
      data: { projectName, clientId, description, status },
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
