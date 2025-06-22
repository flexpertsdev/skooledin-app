import { ChevronRight, User, Bell, Shield, CreditCard, HelpCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '@stores/auth';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile', onClick: () => {} },
        { icon: Bell, label: 'Notifications', onClick: () => {} },
        { icon: Shield, label: 'Privacy & Security', onClick: () => {} },
      ]
    },
    {
      title: 'Subscription',
      items: [
        { icon: CreditCard, label: 'Manage Plan', onClick: () => {} },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', onClick: () => {} },
      ]
    }
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-brand-primary flex items-center justify-center text-white text-2xl font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="p-4 space-y-6">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider px-2 mb-2">
              {group.title}
            </h3>
            <div className="bg-white rounded-xl overflow-hidden">
              {group.items.map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    index > 0 ? 'border-t border-gray-100' : ''
                  }`}
                >
                  <item.icon size={20} className="text-gray-600" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div className="bg-white rounded-xl overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-error"
          >
            <LogOut size={20} />
            <span className="flex-1 text-left">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}