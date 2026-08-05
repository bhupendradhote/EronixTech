import React, { useState, useEffect } from 'react';
import userService from '../../../services/userService';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                const data = await userService.getAllCustomers();
                setCustomers(data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch customers:", err);
                setError(err.response?.data?.message || "Failed to load customers. Ensure you are logged in as an Admin.");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-md my-4 shadow-sm">
                <p className="font-semibold">Error</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    Total: {customers.length}
                </span>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead className="bg-gray-100 text-gray-600 text-left text-sm font-semibold">
                            <tr>
                                <th className="py-3 px-6">Name</th>
                                <th className="py-3 px-6">Contact Info</th>
                                <th className="py-3 px-6">Location</th>
                                <th className="py-3 px-6">Status</th>
                                <th className="py-3 px-6">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {customers.length > 0 ? (
                                customers.map((customer) => (
                                    <tr key={`${customer.user_id}-${customer.address_id || 'no-add'}`} className="hover:bg-gray-50">
                                        <td className="py-4 px-6 text-sm text-gray-800 font-medium">
                                            {customer.full_name}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            <div>{customer.email}</div>
                                            <div className="text-gray-400 text-xs mt-1">
                                                {customer.phone_number || 'No phone'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            {customer.city || customer.state ? (
                                                `${customer.city || ''}${customer.city && customer.state ? ', ' : ''}${customer.state || ''}`
                                            ) : (
                                                <span className="text-gray-400 italic">No address on file</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                customer.is_active 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {customer.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            {new Date(customer.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-gray-500">
                                        No customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Customers;