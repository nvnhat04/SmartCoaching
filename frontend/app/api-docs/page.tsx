"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🏋️ Smart Coaching API Documentation
          </h1>
          <p className="mt-2 text-gray-600">
            Complete API reference for Smart Coaching fitness application
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <SwaggerUI url="/api-docs.json" />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📚 Quick Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-colors"
            >
              <h3 className="font-semibold text-blue-600 mb-2">
                🤖 AI Service API (FastAPI)
              </h3>
              <p className="text-sm text-gray-600">
                Interactive Swagger documentation for pose detection and AI
                recommendations
              </p>
              <p className="text-xs text-gray-500 mt-2">
                http://localhost:8000/docs
              </p>
            </a>

            <a
              href="http://localhost:8000/redoc"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border-2 border-green-200 rounded-lg hover:border-green-400 transition-colors"
            >
              <h3 className="font-semibold text-green-600 mb-2">
                📖 AI Service ReDoc
              </h3>
              <p className="text-sm text-gray-600">
                Alternative documentation view with better readability
              </p>
              <p className="text-xs text-gray-500 mt-2">
                http://localhost:8000/redoc
              </p>
            </a>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            🚀 Getting Started
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                1. Authentication
              </h3>
              <p className="text-sm">
                Use the <code className="bg-gray-100 px-2 py-1 rounded">/api/auth/register</code> endpoint to create a new account,
                then sign in with <code className="bg-gray-100 px-2 py-1 rounded">/api/auth/[...nextauth]</code>.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                2. AI Service
              </h3>
              <p className="text-sm">
                The AI service runs separately on port 8000. Start it with:
              </p>
              <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
                cd ai-service && uvicorn main:app --reload
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                3. Example Request
              </h3>
              <p className="text-sm mb-2">Register a new user:</p>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "age": 25,
    "gender": "male",
    "fitnessLevel": "beginner"
  }'`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                4. Test Credentials
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm font-mono">
                  <strong>Email:</strong> admin@smartcoaching.com<br />
                  <strong>Password:</strong> admin123
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📊 API Endpoints Overview
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    POST
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                    /api/auth/register
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Register new user account
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    POST
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                    /api/auth/[...nextauth]
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    NextAuth authentication
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    POST
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                    /analyze-pose
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Analyze exercise pose from image
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    POST
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                    /analyze-video
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Analyze workout video
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    POST
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                    /get-recommendations
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Get AI workout recommendations
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    GET
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                    /health
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    AI service health check
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
