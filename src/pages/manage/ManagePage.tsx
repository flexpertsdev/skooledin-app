import { Users, FileText, Calendar, MessageSquare } from 'lucide-react';
import { Card } from '@components/common/Card';

export function ManagePage() {
  const managementOptions = [
    {
      icon: Users,
      title: 'Students',
      description: 'Manage student roster and profiles',
      count: 28,
      color: 'bg-brand-primary'
    },
    {
      icon: FileText,
      title: 'Assignments',
      description: 'Create and grade assignments',
      count: 12,
      color: 'bg-subject-math'
    },
    {
      icon: Calendar,
      title: 'Attendance',
      description: 'Track daily attendance',
      count: 95,
      unit: '%',
      color: 'bg-success'
    },
    {
      icon: MessageSquare,
      title: 'Messages',
      description: 'Parent communications',
      count: 3,
      badge: 'New',
      color: 'bg-warning'
    }
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6">Classroom Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {managementOptions.map((option) => (
          <Card
            key={option.title}
            interactive
            className="hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${option.color} rounded-xl flex items-center justify-center text-white`}>
                <option.icon size={24} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">{option.title}</h3>
                  {option.badge && (
                    <span className="badge badge-warning">{option.badge}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {option.count}{option.unit || ''}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}