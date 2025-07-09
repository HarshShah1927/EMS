@@ .. @@
 import Dashboard from './components/Dashboard';
 import Login from './components/Login';
+import UserManagement from './components/UserManagement';
 import EmployeeManagement from './components/EmployeeManagement';
@@ .. @@
           case 'employees':
             return <EmployeeManagement />;
+          case 'users':
+            return <UserManagement />;
           case 'attendance':
@@ .. @@