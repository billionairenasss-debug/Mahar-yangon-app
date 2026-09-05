/*
 * Mahar Yangon Classic Store
 * Customer Data System
 *
 * File:
 * app/src/main/assets/customer.js
 *
 * Purpose:
 * - Add new customers
 * - Find customers by phone / name
 * - Get customer profile
 * - Update customer information
 * - Get customer order history
 * - Add customer notes
 *
 * IMPORTANT:
 * - Uses Supabase Publishable/Anon key only.
 * - NEVER put service_role/secret key in this file.
 */

(function () {
  "use strict";

  // ---------------------------------------------------------
  // Supabase Client
  // ---------------------------------------------------------

  if (!window.MAHAR_CONFIG) {
    console.error("MAHAR_CONFIG is missing.");
    return;
  }

  if (!window.supabase) {
    console.error("Supabase JS library is missing.");
    return;
  }

  const client = supabase.createClient(
    window.MAHAR_CONFIG.SUPABASE_URL,
    window.MAHAR_CONFIG.SUPABASE_PUBLISHABLE_KEY
  );

  window.MAHAR_CUSTOMER = {};

  // ---------------------------------------------------------
  // Helper
  // ---------------------------------------------------------

  function clean(value) {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value).trim();
  }

  function normalizePhone(phone) {
    return clean(phone)
      .replace(/\s+/g, "")
      .replace(/-/g, "");
  }

  function customerError(error) {
    console.error("Customer System Error:", error);

    return {
      success: false,
      error: error?.message || "Customer system error"
    };
  }

  // ---------------------------------------------------------
  // 1. Create Customer
  // ---------------------------------------------------------

  window.MAHAR_CUSTOMER.create = async function (customerData) {

    try {

      customerData = customerData || {};

      const name = clean(customerData.name);
      const phone = normalizePhone(customerData.phone);
      const email = clean(customerData.email);
      const address = clean(customerData.address);
      const township = clean(customerData.township);
      const city = clean(customerData.city);
      const birthday = clean(customerData.birthday);
      const gender = clean(customerData.gender);
      const source = clean(customerData.source);

      if (!name) {
        return {
          success: false,
          error: "Customer name is required."
        };
      }

      if (!phone) {
        return {
          success: false,
          error: "Customer phone is required."
        };
      }

      // Check existing customer first
      const existing = await window.MAHAR_CUSTOMER.findByPhone(phone);

      if (existing.success && existing.data) {
        return {
          success: false,
          duplicate: true,
          data: existing.data,
          error: "Customer already exists."
        };
      }

      const payload = {
        name: name,
        phone: phone,
        email: email || null,
        address: address || null
      };

      /*
       * The base schema contains the main customer fields.
       * Extra fields are only sent if your schema has them.
       *
       * Keep the basic insert compatible with schema.sql.
       */

      const { data, error } = await client
        .from("customers")
        .insert(payload)
        .select("*")
        .single();

      if (error) {
        return customerError(error);
      }

      return {
        success: true,
        data: data
      };

    } catch (error) {
      return customerError(error);
    }
  };

  // ---------------------------------------------------------
  // 2. Find Customer by Phone
  // ---------------------------------------------------------

  window.MAHAR_CUSTOMER.findByPhone = async function (phone) {

    try {

      phone = normalizePhone(phone);

      if (!phone) {
        return {
          success: false,
          error: "Phone number is required."
        };
      }

      const { data, error } = await client
        .from("customers")
        .select("*")
        .eq("phone", phone)
        .maybeSingle();

      if (error) {
        return customerError(error);
      }

      return {
        success: true,
        data: data || null
      };

    } catch (error) {
      return customerError(error);
    }
  };

  // ---------------------------------------------------------
  // 3. Get Customer by ID
  // ---------------------------------------------------------

  window.MAHAR_CUSTOMER.get = async function (customerId) {

    try {

      customerId = clean(customerId);

      if (!customerId) {
        return {
          success: false,
          error: "Customer ID is required."
        };
      }

      const { data, error } = await client
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .maybeSingle();

      if (error) {
        return customerError(error);
      }

      return {
        success: true,
        data: data || null
      };

    } catch (error) {
      return customerError(error);
    }
  };

  // ---------------------------------------------------------
  // 4. Search Customers
  // ---------------------------------------------------------

  window.MAHAR_CUSTOMER.search = async function (keyword) {

    try {

      keyword = clean(keyword);

      if (!keyword) {
        return {
          success: true,
          data: []
        };
      }

      const safeKeyword = keyword
        .replace(/%/g, "")
        .replace(/_/g, "");

      const { data, error } = await client
        .from("customers")
        .select("*")
        .or(
          `name.ilike.%${safeKeyword}%,phone.ilike.%${safeKeyword}%`
        )
        .order("created_at", {
          ascending: false
        })
        .limit(50);

      if (error) {
        return customerError(error);
      }

      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      return customerError(error);
    }
  };

  // ---------------------------------------------------------
  // 5. Get All Customers
  // ---------------------------------------------------------

  window.MAHAR_CUSTOMER.getAll = async function (limit = 100) {

    try {

      limit = Number(limit);

      if (!Number.isFinite(limit) || limit < 1) {
        limit = 100;
      }

      if (limit > 500) {
        limit = 500;
      }

      const { data, error } = await client
        .from("customers")
        .select("*")
        .order("created_at", {
          ascending: false
        })
        .limit(limit);

      if (error) {
        return customerError(error);
      }

      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      return customerError(error);
    }
  };

  // ---------------------------------------------------------
  // 6. Update Customer
  // ---------------------------------------------------------

  window.MAHAR_CUSTOMER.update = async function (
    customerId,
    customerData
  ) {

    try {

      customerId = clean(customerId);
      customerData = customerData || {};

      if (!customerId) {
        return {
          success: false,
          error: "Customer ID is required."
        };
      }

      const payload = {};

      if (customerData.name !== undefined) {
        const name = clean(customerData.name);

        if (!name) {
          return {
            success: false,
            error: "Customer name cannot be empty."
          };
        }

        payload.name = name;
      }

      if (customerData.phone !== undefined) {
        const phone = normalizePhone(customerData.phone);

        if (!phone) {
          return {
            success: false,
            error: "Customer phone cannot be empty."
          };
        }

        payload.phone = phone;
      }

      if (customerData.email !== undefined) {
        payload.email = clean(customerData.email) || null;
      }

      if (customerData.address !== undefined) {
        payload.address = clean(customerData.address) || null;
      }

      if (Object.keys(payload).length === 0) {
        return {
          success: false,
          error: "No customer information to update."
        };
      }

      const { data, error } = await client
        .from("customers")
        .update(payload)
        .eq("id", customerId)
        .select("*")
        .single();

      if (error) {
        return customerError(error);
      }

      return {
        success: true,
        data: data
      };

    } catch (error) {
      return customerError(error);
    }
  };

  // ---------------------------------------------------------
  // 7. Get Customer Order History
  // ---------------------------------------------------------

  window.MAHAR_CUSTOMER.getOrderHistory = async function (
    customerId
  ) {

    try {

      customerId = clean(customerId);

      if (!customerId) {
        return {
          success: false,
          error: "Customer ID is required."
        };
      }

      /*
       * schema.sql creates:
       *
       * public.customer_order_history
       *
       * This view is used instead of the old flat
       * customers.order_item / quantity / total_price structure.
       */

      const { data, error } = await client
        .from("customer_order_history")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", {
          ascending: false
        });

      if (error) {
        return customerError(error);
      }

      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      return customerError(error);
    }
  };

  // ---------------------------------------------------------
  // 8. Add Customer Note
  // ---------------------------------------------------------

  window.MAHAR_CUSTOMER.addNote = async function (
    customerId,
    note
  ) {

    try {

      customerId = clean(customerId);
      note = clean(note);

      if (!customerId) {
        return {
          success: false,
          error: "Customer ID is required."
        };
      }

      if (!note) {
        return {
          success: false,
          error: "Note cannot be empty."
        };
      }

      const { data, error } = await client
        .from("customer_notes")
        .insert({
          customer_id: customerId,
          note: note
        })
        .select("*")
        .single();

      if (error) {
        return customerError(error);
      }

      return {
        success: true,
        data: data
      };

    } catch (error) {
      return customerError(error);
    }
  };

  // ---------------------------------------------------------
  // 9. Get Customer Notes
  // ---------------------------------------------------------

  window.MAHAR_CUSTOMER.getNotes = async function (
    customerId
  ) {

    try {

      customerId = clean(customerId);

      if (!customerId) {
        return {
          success: false,
          error: "Customer ID is required."
        };
      }

      const { data, error } = await client
        .from("customer_notes")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", {
          ascending: false
        });

      if (error) {
        return customerError(error);
      }

      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      return customerError(error);
    }
  };

  // ---------------------------------------------------------
  // 10. Customer Summary
  // ---------------------------------------------------------

  window.MAHAR_CUSTOMER.getSummary = async function (
    customerId
  ) {

    try {

      customerId = clean(customerId);

      if (!customerId) {
        return {
          success: false,
          error: "Customer ID is required."
        };
      }

      const customerResult =
        await window.MAHAR_CUSTOMER.get(customerId);

      if (!customerResult.success) {
        return customerResult;
      }

      const orderResult =
        await window.MAHAR_CUSTOMER.getOrderHistory(customerId);

      if (!orderResult.success) {
        return orderResult;
      }

      const notesResult =
        await window.MAHAR_CUSTOMER.getNotes(customerId);

      if (!notesResult.success) {
        return notesResult;
      }

      const orders = orderResult.data || [];

      let totalOrders = 0;
      let totalSpent = 0;

      orders.forEach(function (order) {

        totalOrders += 1;

        const amount = Number(
          order.total_amount ||
          order.total_price ||
          0
        );

        if (Number.isFinite(amount)) {
          totalSpent += amount;
        }

      });

      return {
        success: true,

        data: {
          customer: customerResult.data,

          orders: orders,

          notes: notesResult.data,

          summary: {
            total_orders: totalOrders,
            total_spent: totalSpent
          }
        }
      };

    } catch (error) {
      return customerError(error);
    }
  };

  // ---------------------------------------------------------
  // 11. Create Customer + Order
  // ---------------------------------------------------------
  /*
   * This function is for the Customer App.
   *
   * Flow:
   *
   * Customer submits order
   *        ↓
   * Find existing customer
   *        ↓
   * Create customer if new
   *        ↓
   * Create order
   *        ↓
   * Create order items
   *
   * The actual order creation is kept in a separate function
   * so Product/Stock System can use it too.
   */

  window.MAHAR_CUSTOMER.findOrCreate = async function (
    customerData
  ) {

    try {

      customerData = customerData || {};

      const phone = normalizePhone(customerData.phone);

      if (!phone) {
        return {
          success: false,
          error: "Phone number is required."
        };
      }

      const existing =
        await window.MAHAR_CUSTOMER.findByPhone(phone);

      if (!existing.success) {
        return existing;
      }

      if (existing.data) {
        return {
          success: true,
          existing: true,
          data: existing.data
        };
      }

      const created =
        await window.MAHAR_CUSTOMER.create({
          name: customerData.name,
          phone: phone,
          email: customerData.email,
          address: customerData.address
        });

      if (!created.success) {
        return created;
      }

      return {
        success: true,
        existing: false,
        data: created.data
      };

    } catch (error) {
      return customerError(error);
    }
  };

  // ---------------------------------------------------------
  // 12. Simple Customer Statistics
  // ---------------------------------------------------------

  window.MAHAR_CUSTOMER.getStats = async function () {

    try {

      const { count, error } = await client
        .from("customers")
        .select("id", {
          count: "exact",
          head: true
        });

      if (error) {
        return customerError(error);
      }

      return {
        success: true,
        data: {
          total_customers: count || 0
        }
      };

    } catch (error) {
      return customerError(error);
    }
  };

  // ---------------------------------------------------------
  // Ready
  // ---------------------------------------------------------

  console.log(
    "Mahar Yangon Customer Data System loaded."
  );

})();
