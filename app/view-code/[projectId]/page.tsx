import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import React from 'react';
import ProjectView from './ProjectView';


export default async function ProjectPage({ params }: { params: { projectId: string } }) {
    const supabase = createServerComponentClient({ cookies });

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        notFound();
    }
    
    const { data: project } = await supabase
        .from('projects')
        .select('id, generated_code, image_url, description, ai_model')
        .eq('id', params.projectId)
        .eq('user_id', user.id)
        .single();
    
    if (!project) {
        notFound();
    }

    return <ProjectView initialProject={project} />;
}