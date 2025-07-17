import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Truck, Package, Clock, CheckCircle, User, MapPin, Calendar, Download, Eye } from 'lucide-react';

const Dispatch: React.FC = () => {
  const { dispatch, updateDispatch, downloadDispatchSlip } = useData();
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<any>(null);

  const filteredDispatch = dispatch.filter(item => {
    return statusFilter === 'all' || item.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'packed': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <Package className="h-4 w-4" />;
      case 'packed': return <Package className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const updateStatus = (id: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    
    if (newStatus === 'in_transit' && !dispatch.find(d => d.id === id)?.dispatchDate) {
      updates.dispatchDate = new Date().toISOString().split('T')[0];
    }
    
    if (newStatus === 'delivered') {
      updates.deliveryDate = new Date().toISOString().split('T')[0];
    }
    
    updateDispatch(id, updates);
  };

  const viewDetails = (dispatchItem: any) => {
    setSelectedDispatch(dispatchItem);
    setShowDetailsModal(true);
  };

  const handleDownloadSlip = async (dispatchItem: any) => {
    await downloadDispatchSlip(dispatchItem);
  };

  const dispatchStats = {
    ready: dispatch.filter(item => item.status === 'ready').length,
    packed: dispatch.filter(item => item.status === 'packed').length,
    inTransit: dispatch.filter(item => item.status === 'in_transit').length,
    delivered: dispatch.filter(item => item.status === 'delivered').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dispatch Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
          <Truck className="h-4 w-4" />
          Create Dispatch
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ready</p>
              <p className="text-2xl font-bold text-gray-900">{dispatchStats.ready}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-lg p-3">
              <Package className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Packed</p>
              <p className="text-2xl font-bold text-gray-900">{dispatchStats.packed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-lg p-3">
              <Truck className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-gray-900">{dispatchStats.inTransit}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{dispatchStats.delivered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="ready">Ready</option>
            <option value="packed">Packed</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Dispatch Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDispatch.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{item.orderNumber}</h3>
                <p className="text-sm text-gray-500">{item.client}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                {getStatusIcon(item.status)}
                <span className="ml-1 capitalize">{item.status.replace('_', ' ')}</span>
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                <div className="space-y-1">
                  {item.items.map((product, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{product.name}</span>
                      <span className="text-gray-900 font-medium">×{product.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {item.assignedTo && (
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>Assigned to: {item.assignedTo}</span>
                </div>
              )}

              {item.dispatchDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Dispatched: {new Date(item.dispatchDate).toLocaleDateString()}</span>
                </div>
              )}

              {item.deliveryDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Delivered: {new Date(item.deliveryDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Update Status:</span>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={item.status}
                  onChange={(e) => updateStatus(item.id, e.target.value)}
                >
                  <option value="ready">Ready</option>
                  <option value="packed">Packed</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => viewDetails(item)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
              <button 
                onClick={() => handleDownloadSlip(item)}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Generate Slip
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedDispatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Dispatch Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Order Number</p>
                  <p className="text-lg font-semibold">{selectedDispatch.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedDispatch.status)}`}>
                    {getStatusIcon(selectedDispatch.status)}
                    <span className="ml-1 capitalize">{selectedDispatch.status.replace('_', ' ')}</span>
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Client</p>
                  <p className="text-lg font-semibold">{selectedDispatch.client}</p>
                </div>
                {selectedDispatch.assignedTo && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Assigned To</p>
                    <p className="text-lg font-semibold">{selectedDispatch.assignedTo}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold mb-4">Items</h4>
                <div className="space-y-2">
                  {selectedDispatch.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-600">Quantity: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold mb-4">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span>Order created and ready for packing</span>
                  </div>
                  {selectedDispatch.dispatchDate && (
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <span>Dispatched on {new Date(selectedDispatch.dispatchDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedDispatch.deliveryDate && (
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span>Delivered on {new Date(selectedDispatch.deliveryDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleDownloadSlip(selectedDispatch)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download PDF Slip
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Urgent Dispatches */}
      {dispatch.filter(item => item.status === 'ready').length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Truck className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Urgent Dispatches</h3>
          </div>
          <div className="space-y-2">
            {dispatch.filter(item => item.status === 'ready').map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.orderNumber}</p>
                  <p className="text-sm text-gray-600">{item.client}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(item.id, 'packed')}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Mark as Packed
                  </button>
                  <button
                    onClick={() => handleDownloadSlip(item)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Generate Slip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dispatch;