// src/services/resumeService.ts

export async function uploadResume(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('resume', file);
  const res = await fetch('/api/resumes/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Resume upload failed');
  return res.json();
}
