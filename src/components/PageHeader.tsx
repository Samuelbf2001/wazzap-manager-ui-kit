import { UserAccountIndicator } from './UserAccountIndicator';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {action && (
                <div>
                  {action}
                </div>
              )}
              <UserAccountIndicator />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 