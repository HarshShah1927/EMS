@@ .. @@
 import React from 'react';
-import { Home, Users, Clock, DollarSign, FileText, Package, BarChart3, Settings, LogOut } from 'lucide-react';
+import { Home, Users, Clock, DollarSign, FileText, Package, BarChart3, Settings, LogOut, UserCog } from 'lucide-react';

@@ .. @@
   const menuItems = [
     { id: 'dashboard', label: 'Dashboard', icon: Home },
     { id: 'employees', label: 'Employees', icon: Users },
   ]
+    { id: 'users', label: 'User Management', icon: UserCog },
     { id: 'attendance', label: 'Attendance', icon: Clock },
@@ .. @@