import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { CreditCard, Zap, Clock, CheckCircle } from 'lucide-react';

export const CreditsPage: React.FC = () => {
  const pricingPlans = [
    {
      name: 'Starter Pack',
      credits: 10,
      price: 9.99,
      duration: '30 days',
      popular: false,
      features: [
        '10 interview credits',
        'Basic AI responses',
        'Email support',
        'Web platform access'
      ]
    },
    {
      name: 'Professional',
      credits: 25,
      price: 19.99,
      duration: '60 days',
      popular: true,
      features: [
        '25 interview credits',
        'Advanced AI responses',
        'Priority support',
        'Desktop app access',
        'Resume analysis'
      ]
    },
    {
      name: 'Enterprise',
      credits: 50,
      price: 34.99,
      duration: '90 days',
      popular: false,
      features: [
        '50 interview credits',
        'Premium AI responses',
        '24/7 support',
        'All platform access',
        'Custom integrations',
        'Analytics dashboard'
      ]
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Interview Credits</h1>
          <p className="mt-2 text-gray-600">Choose the plan that fits your interview needs. No subscriptions, just credits!</p>
        </div>

        {/* Current Credits */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Your Current Credits</h2>
              <div className="flex items-center gap-2 mt-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">15</span>
                <span className="text-gray-600">credits remaining</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Expires in</p>
              <p className="text-lg font-semibold text-gray-900">23 days</p>
            </div>
          </div>
        </div>
        
        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
                plan.popular ? 'border-2 border-blue-500' : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600 ml-1">one-time</span>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">{plan.credits} Credits</span>
                </div>
                
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Valid for {plan.duration}</span>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Purchase Credits
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Usage History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Credit Usage History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-sm font-medium text-gray-600">Date</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Session</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Duration</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Credits Used</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 text-sm text-gray-900">Dec 20, 2024</td>
                  <td className="py-3 text-sm text-gray-900">Google Interview - Software Engineer</td>
                  <td className="py-3 text-sm text-gray-600">45 minutes</td>
                  <td className="py-3 text-sm text-gray-900">3 credits</td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-sm text-gray-900">Dec 18, 2024</td>
                  <td className="py-3 text-sm text-gray-900">Microsoft Interview - Product Manager</td>
                  <td className="py-3 text-sm text-gray-600">60 minutes</td>
                  <td className="py-3 text-sm text-gray-900">4 credits</td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-sm text-gray-900">Dec 16, 2024</td>
                  <td className="py-3 text-sm text-gray-900">Trial Session</td>
                  <td className="py-3 text-sm text-gray-600">10 minutes</td>
                  <td className="py-3 text-sm text-gray-900">0 credits</td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Free Trial
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};
