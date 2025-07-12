import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  BookOpen,
  MessageSquare,
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Globe,
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Users,
      title: 'Connect with Learners',
      description: 'Find people who want to learn what you know and teach what you want to learn.',
    },
    {
      icon: BookOpen,
      title: 'Skill Exchange',
      description: 'Trade your expertise for new knowledge in a fair, collaborative environment.',
    },
    {
      icon: MessageSquare,
      title: 'Direct Communication',
      description: 'Chat directly with potential skill partners and arrange your learning sessions.',
    },
    {
      icon: Star,
      title: 'Build Reputation',
      description: 'Earn ratings and reviews to build trust within the community.',
    },
  ];

  const benefits = [
    'Learn new skills without paying for expensive courses',
    'Share your expertise and help others grow',
    'Build meaningful connections in your field',
    'Flexible scheduling that works for you',
    'Safe and verified community members',
    'Track your learning progress and achievements',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SB</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Skill Barter</span>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-primary"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Learn Skills by
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                {' '}Teaching Skills
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join a community where knowledge flows freely. Trade your expertise for new skills 
              and build meaningful connections with learners worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-primary btn-lg inline-flex items-center"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="btn-primary btn-lg inline-flex items-center"
                  >
                    Start Learning Today
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn-outline btn-lg"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Skill Barter Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A simple, effective way to exchange knowledge and grow together
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Skill Barter?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of learners who are already benefiting from our skill exchange platform.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Start?
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your profile, list your skills, and start connecting with learners today.
                </p>
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="btn-primary btn-lg w-full"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/signup"
                    className="btn-primary btn-lg w-full"
                  >
                    Create Free Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-gray-600">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Skills Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">200+</div>
              <div className="text-gray-600">Successful Swaps</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SB</span>
                </div>
                <span className="text-xl font-bold">Skill Barter</span>
              </div>
              <p className="text-gray-400 mb-4">
                Connect, learn, and grow through skill swapping. Join our community of learners 
                and teachers who believe in the power of knowledge exchange.
              </p>
              <div className="flex items-center space-x-4">
                <Globe className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">Global Community</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/skills" className="hover:text-white">Skills</Link></li>
                <li><Link to="/users" className="hover:text-white">Find Users</Link></li>
                <li><Link to="/swaps" className="hover:text-white">Swaps</Link></li>
                <li><Link to="/feedback" className="hover:text-white">Feedback</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Skill Barter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 