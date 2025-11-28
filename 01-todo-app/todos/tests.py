from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from datetime import date, timedelta
from .models import Todo


class TodoModelTests(TestCase):
    """Test the Todo model"""

    def test_create_todo_with_all_fields(self):
        """Test creating a todo with all fields"""
        due_date = date.today() + timedelta(days=7)
        todo = Todo.objects.create(
            title="Test Todo",
            description="Test Description",
            due_date=due_date
        )
        self.assertEqual(todo.title, "Test Todo")
        self.assertEqual(todo.description, "Test Description")
        self.assertEqual(todo.due_date, due_date)
        self.assertFalse(todo.resolved)

    def test_create_todo_minimal_fields(self):
        """Test creating a todo with only required fields"""
        todo = Todo.objects.create(title="Minimal Todo")
        self.assertEqual(todo.title, "Minimal Todo")
        self.assertEqual(todo.description, "")
        self.assertIsNone(todo.due_date)
        self.assertFalse(todo.resolved)

    def test_todo_default_values(self):
        """Test default values are set correctly"""
        todo = Todo.objects.create(title="Test")
        self.assertFalse(todo.resolved)
        self.assertIsNotNone(todo.created_at)
        self.assertIsNotNone(todo.updated_at)

    def test_todo_string_representation(self):
        """Test the string representation of a todo"""
        todo = Todo.objects.create(title="My Todo Item")
        self.assertEqual(str(todo), "My Todo Item")

    def test_todo_ordering(self):
        """Test todos are ordered by created_at descending"""
        from datetime import timedelta
        now = timezone.now()

        todo1 = Todo.objects.create(title="First")
        todo1.created_at = now - timedelta(hours=2)
        todo1.save()

        todo2 = Todo.objects.create(title="Second")
        todo2.created_at = now - timedelta(hours=1)
        todo2.save()

        todo3 = Todo.objects.create(title="Third")
        todo3.created_at = now
        todo3.save()

        todos = list(Todo.objects.all())
        self.assertEqual(todos[0], todo3)
        self.assertEqual(todos[1], todo2)
        self.assertEqual(todos[2], todo1)


class TodoListViewTests(TestCase):
    """Test the todo list view"""

    def test_empty_todo_list(self):
        """Test list view with no todos"""
        response = self.client.get(reverse('todo_list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "No todos yet")
        self.assertEqual(len(response.context['todos']), 0)

    def test_todo_list_with_multiple_todos(self):
        """Test list view displays multiple todos"""
        Todo.objects.create(title="Todo 1")
        Todo.objects.create(title="Todo 2")
        Todo.objects.create(title="Todo 3")

        response = self.client.get(reverse('todo_list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context['todos']), 3)
        self.assertContains(response, "Todo 1")
        self.assertContains(response, "Todo 2")
        self.assertContains(response, "Todo 3")

    def test_todo_list_shows_resolved_status(self):
        """Test list view shows resolved and unresolved todos"""
        Todo.objects.create(title="Active Todo", resolved=False)
        Todo.objects.create(title="Completed Todo", resolved=True)

        response = self.client.get(reverse('todo_list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Active Todo")
        self.assertContains(response, "Completed Todo")


class TodoCreateViewTests(TestCase):
    """Test the todo create view"""

    def test_create_view_get_request(self):
        """Test GET request to create view returns form"""
        response = self.client.get(reverse('todo_create'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Create Todo")
        self.assertContains(response, 'name="title"')

    def test_create_todo_with_all_fields(self):
        """Test POST request creates todo with all fields"""
        due_date = date.today() + timedelta(days=5)
        response = self.client.post(reverse('todo_create'), {
            'title': 'New Todo',
            'description': 'New Description',
            'due_date': due_date.strftime('%Y-%m-%d')
        })

        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('todo_list'))

        todo = Todo.objects.get(title='New Todo')
        self.assertEqual(todo.description, 'New Description')
        self.assertEqual(todo.due_date, due_date)
        self.assertFalse(todo.resolved)

    def test_create_todo_minimal_data(self):
        """Test POST request creates todo with minimal data"""
        response = self.client.post(reverse('todo_create'), {
            'title': 'Simple Todo'
        })

        self.assertEqual(response.status_code, 302)
        self.assertEqual(Todo.objects.count(), 1)

        todo = Todo.objects.first()
        self.assertEqual(todo.title, 'Simple Todo')
        self.assertEqual(todo.description, '')
        self.assertIsNone(todo.due_date)


class TodoEditViewTests(TestCase):
    """Test the todo edit view"""

    def test_edit_view_get_request(self):
        """Test GET request to edit view shows pre-filled form"""
        todo = Todo.objects.create(
            title="Original Title",
            description="Original Description"
        )

        response = self.client.get(reverse('todo_edit', args=[todo.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Edit Todo")
        self.assertContains(response, "Original Title")
        self.assertContains(response, "Original Description")

    def test_edit_todo_post_request(self):
        """Test POST request updates the todo"""
        todo = Todo.objects.create(title="Old Title")

        response = self.client.post(reverse('todo_edit', args=[todo.pk]), {
            'title': 'Updated Title',
            'description': 'Updated Description'
        })

        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('todo_list'))

        todo.refresh_from_db()
        self.assertEqual(todo.title, 'Updated Title')
        self.assertEqual(todo.description, 'Updated Description')

    def test_edit_nonexistent_todo(self):
        """Test editing non-existent todo returns 404"""
        response = self.client.get(reverse('todo_edit', args=[999]))
        self.assertEqual(response.status_code, 404)


class TodoDeleteViewTests(TestCase):
    """Test the todo delete view"""

    def test_delete_view_get_request(self):
        """Test GET request shows confirmation page"""
        todo = Todo.objects.create(title="To Be Deleted")

        response = self.client.get(reverse('todo_delete', args=[todo.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Delete Todo")
        self.assertContains(response, "To Be Deleted")

    def test_delete_todo_post_request(self):
        """Test POST request deletes the todo"""
        todo = Todo.objects.create(title="Delete Me")
        todo_pk = todo.pk

        response = self.client.post(reverse('todo_delete', args=[todo_pk]))

        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('todo_list'))
        self.assertEqual(Todo.objects.count(), 0)

        with self.assertRaises(Todo.DoesNotExist):
            Todo.objects.get(pk=todo_pk)

    def test_delete_nonexistent_todo(self):
        """Test deleting non-existent todo returns 404"""
        response = self.client.get(reverse('todo_delete', args=[999]))
        self.assertEqual(response.status_code, 404)


class TodoToggleResolvedViewTests(TestCase):
    """Test the todo toggle resolved view"""

    def test_toggle_from_unresolved_to_resolved(self):
        """Test toggling todo from unresolved to resolved"""
        todo = Todo.objects.create(title="Active Task", resolved=False)

        response = self.client.post(reverse('todo_toggle_resolved', args=[todo.pk]))

        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('todo_list'))

        todo.refresh_from_db()
        self.assertTrue(todo.resolved)

    def test_toggle_from_resolved_to_unresolved(self):
        """Test toggling todo from resolved to unresolved"""
        todo = Todo.objects.create(title="Completed Task", resolved=True)

        response = self.client.post(reverse('todo_toggle_resolved', args=[todo.pk]))

        self.assertEqual(response.status_code, 302)

        todo.refresh_from_db()
        self.assertFalse(todo.resolved)

    def test_toggle_nonexistent_todo(self):
        """Test toggling non-existent todo returns 404"""
        response = self.client.post(reverse('todo_toggle_resolved', args=[999]))
        self.assertEqual(response.status_code, 404)


class TodoURLTests(TestCase):
    """Test URL routing"""

    def test_list_url_resolves(self):
        """Test list URL resolves correctly"""
        url = reverse('todo_list')
        self.assertEqual(url, '/')

    def test_create_url_resolves(self):
        """Test create URL resolves correctly"""
        url = reverse('todo_create')
        self.assertEqual(url, '/create/')

    def test_edit_url_resolves(self):
        """Test edit URL resolves correctly"""
        url = reverse('todo_edit', args=[1])
        self.assertEqual(url, '/edit/1/')

    def test_delete_url_resolves(self):
        """Test delete URL resolves correctly"""
        url = reverse('todo_delete', args=[1])
        self.assertEqual(url, '/delete/1/')

    def test_toggle_url_resolves(self):
        """Test toggle resolved URL resolves correctly"""
        url = reverse('todo_toggle_resolved', args=[1])
        self.assertEqual(url, '/toggle/1/')
