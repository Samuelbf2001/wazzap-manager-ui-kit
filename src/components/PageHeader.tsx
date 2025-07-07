import { Home, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumbs = [], action }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBreadcrumbClick = (href?: string) => {
    if (href) {
      navigate(href);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Home className="w-4 h-4" />
            </button>
            
            <ChevronRight className="w-4 h-4 text-gray-400" />
            
            <button
              onClick={() => navigate('/conexiones')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Dashboard
            </button>

            {breadcrumbs.map((breadcrumb, index) => (
              <div key={index} className="flex items-center space-x-2">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                {breadcrumb.href ? (
                  <button
                    onClick={() => handleBreadcrumbClick(breadcrumb.href)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {breadcrumb.label}
                  </button>
                ) : (
                  <span className="text-gray-500">{breadcrumb.label}</span>
                )}
              </div>
            ))}

            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">{title}</span>
          </nav>

          {/* Page Title */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
              )}
            </div>
            {action && (
              <div className="ml-4">
                {action}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 