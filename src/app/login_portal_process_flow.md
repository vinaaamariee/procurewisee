# Login & Registration Portal Process Flow

This document details the system workflow and process architecture of the **Login & Registration Portal** at `/` (root page).

---

## 🔄 Simplified Workflow Diagram

```mermaid
flowchart TD
    Start([👤 User visits root /]) --> Choice{Action?}
    
    %% Login
    Choice -->|Login| Sign_In[Submit email/password]
    Sign_In --> Auth{Supabase Auth}
    Auth -->|Failed| Err_Redirect[Show error on login page]
    Auth -->|Success| Profile_Check{Is Profile Active?}
    Profile_Check -->|No| Sign_Out[Log out + Show error]
    Profile_Check -->|Yes| Role_Route{Role Home Page}
    Role_Route -->|Officer| Officer_Home["/dashboard/officer"]
    Role_Route -->|Approver| Approver_Home["/dashboard/approver"]
    Role_Route -->|Supplier| Supplier_Home["/dashboard/supplier"]

    %% Register
    Choice -->|Register| Sign_Up[Submit company & user info]
    Sign_Up --> Create_Auth{Supabase SignUp}
    Create_Auth -->|Failed| Err_Reg[Show registration error]
    Create_Auth -->|Success| Save_Vendor[Prisma: Create Supplier row]
    Save_Vendor --> Route_Home[Login & redirect to Supplier Home]
```

---

## 📋 Core Processes

### 1. Unified Authentication
* **Supabase Validation**: Authenticates credentials using Supabase Auth.
* **Profile Gate**: Checks `user_profiles` to verify the account is `isActive`. If deactivated, logs the user out.
* **Role Routing**: Directs users to their specific dashboard based on their database role.

### 2. Supplier Registration
* **Account Creation**: Registers credentials on Supabase Auth, triggering an automatic sync into the `user_profiles` database table.
* **Vendor Database**: Saves business details (TIN, contact numbers, and business address) into the `suppliers` database table.

