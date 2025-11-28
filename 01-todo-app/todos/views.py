from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from .models import Todo


def todo_list(request):
    todos = Todo.objects.all()
    return render(request, 'todos/todo_list.html', {'todos': todos})


def todo_create(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description', '')
        due_date = request.POST.get('due_date') or None

        Todo.objects.create(
            title=title,
            description=description,
            due_date=due_date
        )
        return redirect('todo_list')

    return render(request, 'todos/todo_form.html', {'action': 'Create'})


def todo_edit(request, pk):
    todo = get_object_or_404(Todo, pk=pk)

    if request.method == 'POST':
        todo.title = request.POST.get('title')
        todo.description = request.POST.get('description', '')
        todo.due_date = request.POST.get('due_date') or None
        todo.save()
        return redirect('todo_list')

    return render(request, 'todos/todo_form.html', {'todo': todo, 'action': 'Edit'})


def todo_delete(request, pk):
    todo = get_object_or_404(Todo, pk=pk)

    if request.method == 'POST':
        todo.delete()
        return redirect('todo_list')

    return render(request, 'todos/todo_confirm_delete.html', {'todo': todo})


def todo_toggle_resolved(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    todo.resolved = not todo.resolved
    todo.save()
    return redirect('todo_list')
